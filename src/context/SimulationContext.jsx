import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { INITIAL_STATE } from '../data/simulationData';
import { getHealth, getVideoCatalog } from '../api/client';

const SimulationContext = createContext(null);

export function SimulationProvider({ children }) {
  // Real Backend Connectivity & Catalogue State
  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking' | 'healthy' | 'degraded' | 'offline'
  const [backendDiagnostics, setBackendDiagnostics] = useState(null);
  const [lastHealthCheckTime, setLastHealthCheckTime] = useState(null);
  const [catalogVideos, setCatalogVideos] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState(null);

  const [trafficLevel, setTrafficLevel] = useState(INITIAL_STATE.trafficLevel);
  const [activeUsers, setActiveUsers] = useState(INITIAL_STATE.activeUsers);
  const [requestsPerSecond, setRequestsPerSecond] = useState(INITIAL_STATE.requestsPerSecond);
  const [cpuUsage, setCpuUsage] = useState(INITIAL_STATE.cpuUsage);
  const [memoryUsage, setMemoryUsage] = useState(INITIAL_STATE.memoryUsage);
  const [responseTime, setResponseTime] = useState(INITIAL_STATE.responseTime);
  const [serverInstances, setServerInstances] = useState(INITIAL_STATE.serverInstances);
  
  const [autoScalingEnabled, setAutoScalingEnabled] = useState(INITIAL_STATE.autoScalingEnabled);
  const [autoScalingStep, setAutoScalingStep] = useState(INITIAL_STATE.autoScalingStep);
  const [isScalingInProgress, setIsScalingInProgress] = useState(INITIAL_STATE.isScalingInProgress);

  const [deploymentStatus, setDeploymentStatus] = useState(INITIAL_STATE.deploymentStatus);
  const [deploymentProgress, setDeploymentProgress] = useState(INITIAL_STATE.deploymentProgress);
  const [isDeploying, setIsDeploying] = useState(INITIAL_STATE.isDeploying);
  const [applicationVersion, setApplicationVersion] = useState(INITIAL_STATE.applicationVersion);

  const [systemStatus, setSystemStatus] = useState(INITIAL_STATE.systemStatus);
  const [presentationMode, setPresentationMode] = useState(INITIAL_STATE.presentationMode);
  const [activityLogs, setActivityLogs] = useState(INITIAL_STATE.activityLogs);
  const [metricsHistory, setMetricsHistory] = useState(INITIAL_STATE.metricsHistory);

  const [failedServerId, setFailedServerId] = useState(null);

  // Helper to format timestamps
  const getTimestamp = () => {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
  };

  const addLog = (message, type = 'info') => {
    const newLog = {
      id: Date.now() + Math.random(),
      timestamp: getTimestamp(),
      message,
      type
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 49)]); // keep latest 50 logs
  };

  // Real backend health check polling
  const refreshHealth = useCallback(async () => {
    const { data, error, isOnline } = await getHealth();
    setLastHealthCheckTime(new Date().toLocaleTimeString());
    if (isOnline && data) {
      setBackendStatus(data.status || 'healthy');
      setBackendDiagnostics(data);
    } else {
      setBackendStatus('offline');
      setBackendDiagnostics(null);
    }
  }, []);

  // Real video catalogue discovery fetch
  const refreshCatalog = useCallback(async () => {
    setCatalogLoading(true);
    setCatalogError(null);
    const { data, error } = await getVideoCatalog();
    if (data && data.videos) {
      setCatalogVideos(data.videos);
      setCatalogError(null);
    } else {
      setCatalogError(error || 'Failed to discover videos from backend');
      setCatalogVideos([]);
    }
    setCatalogLoading(false);
  }, []);

  // Initial load and periodic health check
  useEffect(() => {
    refreshHealth();
    refreshCatalog();

    const healthInterval = setInterval(() => {
      refreshHealth();
    }, 10000);

    return () => clearInterval(healthInterval);
  }, [refreshHealth, refreshCatalog]);

  // Keep a periodic history record for charts and subtle live fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      // Small realistic fluctuation
      const jitter = (Math.random() - 0.5) * 2;
      const currentCpu = Math.max(10, Math.min(100, Math.round(cpuUsage + jitter)));
      
      setMetricsHistory(prev => {
        const nextTime = getTimestamp().slice(0, 5);
        const newPoint = {
          time: nextTime,
          cpu: currentCpu,
          users: activeUsers,
          requests: requestsPerSecond,
          instances: serverInstances.length
        };
        const updated = [...prev.slice(-14), newPoint];
        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [cpuUsage, activeUsers, requestsPerSecond, serverInstances.length]);

  // Traffic setters
  const setNormalTraffic = () => {
    setTrafficLevel('normal');
    setActiveUsers(100);
    setRequestsPerSecond(20);
    setCpuUsage(30);
    setMemoryUsage(40);
    setResponseTime(42);
    setSystemStatus('HEALTHY');
    
    // If not auto-scaled, keep 1 instance
    if (!autoScalingEnabled) {
      setServerInstances([
        {
          id: 1,
          name: 'Backend Instance 1',
          status: 'healthy',
          cpu: 30,
          memory: 40,
          requests: 20,
          trafficShare: 100,
          port: 8081,
          zone: 'us-east-1a'
        }
      ]);
    } else {
      // With autoscaling already active, distribute normal load evenly
      const perServerReq = Math.round(20 / serverInstances.length);
      setServerInstances(prev => prev.map((inst, idx) => ({
        ...inst,
        status: inst.id === failedServerId ? 'failed' : 'healthy',
        cpu: inst.id === failedServerId ? 0 : 25,
        memory: inst.id === failedServerId ? 0 : 35,
        requests: inst.id === failedServerId ? 0 : perServerReq,
        trafficShare: inst.id === failedServerId ? 0 : Math.round(100 / (prev.length - (failedServerId ? 1 : 0)))
      })));
    }

    addLog('Normal traffic simulated: 100 active users, 20 req/sec.', 'info');
  };

  const increaseTraffic = () => {
    setTrafficLevel('high');
    setActiveUsers(1000);
    setRequestsPerSecond(180);
    setResponseTime(180);

    if (!autoScalingEnabled && serverInstances.length === 1) {
      setCpuUsage(75);
      setMemoryUsage(68);
      setSystemStatus('WARNING');
      setServerInstances([
        {
          id: 1,
          name: 'Backend Instance 1',
          status: 'warning',
          cpu: 75,
          memory: 68,
          requests: 180,
          trafficShare: 100,
          port: 8081,
          zone: 'us-east-1a'
        }
      ]);
      addLog('Traffic increased to 1,000 users. Single instance CPU reached 75%. System Status: WARNING.', 'warning');
    } else {
      // Already scaled
      const healthyCount = serverInstances.filter(s => s.id !== failedServerId).length || 1;
      const perServerCpu = Math.round(180 / healthyCount * 0.7);
      const perServerReq = Math.round(180 / healthyCount);
      setCpuUsage(Math.min(65, perServerCpu));
      setMemoryUsage(55);
      setSystemStatus('HEALTHY');
      setServerInstances(prev => prev.map(s => {
        if (s.id === failedServerId) {
          return { ...s, status: 'failed', cpu: 0, requests: 0, trafficShare: 0 };
        }
        return {
          ...s,
          status: 'healthy',
          cpu: perServerCpu,
          requests: perServerReq,
          trafficShare: Math.round(100 / healthyCount)
        };
      }));
      addLog('Traffic increased to 1,000 users. Distributed across scaled instances.', 'info');
    }
  };

  const increaseExtremeTraffic = () => {
    setTrafficLevel('extreme');
    setActiveUsers(2500);
    setRequestsPerSecond(350);
    setResponseTime(540);

    if (!autoScalingEnabled && serverInstances.length === 1) {
      setCpuUsage(95);
      setMemoryUsage(88);
      setSystemStatus('OVERLOADED');
      setServerInstances([
        {
          id: 1,
          name: 'Backend Instance 1',
          status: 'failed', // heavily strained
          cpu: 95,
          memory: 88,
          requests: 350,
          trafficShare: 100,
          port: 8081,
          zone: 'us-east-1a'
        }
      ]);
      addLog('CRITICAL: Extreme traffic surge! 2,500 users, 350 req/s. CPU spiked to 95%. System OVERLOADED.', 'danger');
    } else {
      // Scaled system handling extreme traffic
      const healthyCount = serverInstances.filter(s => s.id !== failedServerId).length || 1;
      const perServerCpu = Math.round(350 / healthyCount * 0.45);
      const perServerReq = Math.round(350 / healthyCount);
      setCpuUsage(Math.min(68, perServerCpu));
      setMemoryUsage(60);
      setSystemStatus('HEALTHY');
      setServerInstances(prev => prev.map(s => {
        if (s.id === failedServerId) {
          return { ...s, status: 'failed', cpu: 0, requests: 0, trafficShare: 0 };
        }
        return {
          ...s,
          status: 'healthy',
          cpu: perServerCpu,
          requests: perServerReq,
          trafficShare: Math.round(100 / healthyCount)
        };
      }));
      addLog('Extreme traffic (2,500 users, 350 req/s) sustained via scaled instances.', 'warning');
    }
  };

  // Step-by-step Auto-Scaling Simulation
  const enableAutoScaling = () => {
    if (isScalingInProgress) return;
    setIsScalingInProgress(true);
    setAutoScalingEnabled(true);

    addLog('High load detected above 75% threshold. Initializing Auto-Scaling Engine...', 'warning');
    setAutoScalingStep('detecting');

    setTimeout(() => {
      setAutoScalingStep('scaling');
      addLog('Auto-scaler triggering Horizontal Pod Autoscaler (HPA) scale-out...', 'info');

      setTimeout(() => {
        setAutoScalingStep('creating_2');
        setServerInstances(prev => [
          prev[0] ? { ...prev[0], status: 'warning', cpu: 78 } : {
            id: 1,
            name: 'Backend Instance 1',
            status: 'warning',
            cpu: 78,
            memory: 60,
            requests: 220,
            trafficShare: 65,
            port: 8081,
            zone: 'us-east-1a'
          },
          {
            id: 2,
            name: 'Backend Instance 2',
            status: 'starting',
            cpu: 35,
            memory: 45,
            requests: 130,
            trafficShare: 35,
            port: 8082,
            zone: 'us-east-1b'
          }
        ]);
        setCpuUsage(72);
        addLog('Spinning up Backend Instance 2 in zone us-east-1b...', 'info');

        setTimeout(() => {
          setAutoScalingStep('creating_3');
          setServerInstances([
            {
              id: 1,
              name: 'Backend Instance 1',
              status: 'healthy',
              cpu: 58,
              memory: 52,
              requests: 120,
              trafficShare: 34,
              port: 8081,
              zone: 'us-east-1a'
            },
            {
              id: 2,
              name: 'Backend Instance 2',
              status: 'healthy',
              cpu: 54,
              memory: 50,
              requests: 115,
              trafficShare: 33,
              port: 8082,
              zone: 'us-east-1b'
            },
            {
              id: 3,
              name: 'Backend Instance 3',
              status: 'starting',
              cpu: 52,
              memory: 48,
              requests: 115,
              trafficShare: 33,
              port: 8083,
              zone: 'us-east-1c'
            }
          ]);
          setCpuUsage(62);
          addLog('Spinning up Backend Instance 3 in zone us-east-1c...', 'info');

          setTimeout(() => {
            setAutoScalingStep('balancing');
            addLog('Load balancer updating upstream target group. Distributing traffic evenly (33% / 33% / 34%)...', 'info');

            setTimeout(() => {
              setAutoScalingStep('complete');
              setIsScalingInProgress(false);
              setCpuUsage(58);
              setMemoryUsage(52);
              setResponseTime(65);
              setSystemStatus('HEALTHY');
              setServerInstances([
                {
                  id: 1,
                  name: 'Backend Instance 1',
                  status: 'healthy',
                  cpu: 54,
                  memory: 52,
                  requests: 120,
                  trafficShare: 34,
                  port: 8081,
                  zone: 'us-east-1a'
                },
                {
                  id: 2,
                  name: 'Backend Instance 2',
                  status: 'healthy',
                  cpu: 48,
                  memory: 50,
                  requests: 115,
                  trafficShare: 33,
                  port: 8082,
                  zone: 'us-east-1b'
                },
                {
                  id: 3,
                  name: 'Backend Instance 3',
                  status: 'healthy',
                  cpu: 52,
                  memory: 49,
                  requests: 115,
                  trafficShare: 33,
                  port: 8083,
                  zone: 'us-east-1c'
                }
              ]);
              addLog('Auto-scaling completed: 3 healthy instances. CPU normalized to 58%. System Status: HEALTHY.', 'success');
            }, 1200);
          }, 1200);
        }, 1200);
      }, 1200);
    }, 1000);
  };

  // Server Failure Simulation
  const simulateServerFailure = (targetId = 2) => {
    // Ensure we have at least 2 or 3 instances so we can demonstrate High Availability failover
    let instances = [...serverInstances];
    if (instances.length < 3) {
      instances = [
        { id: 1, name: 'Backend Instance 1', status: 'healthy', cpu: 54, memory: 52, requests: 120, trafficShare: 34, port: 8081, zone: 'us-east-1a' },
        { id: 2, name: 'Backend Instance 2', status: 'healthy', cpu: 48, memory: 50, requests: 115, trafficShare: 33, port: 8082, zone: 'us-east-1b' },
        { id: 3, name: 'Backend Instance 3', status: 'healthy', cpu: 52, memory: 49, requests: 115, trafficShare: 33, port: 8083, zone: 'us-east-1c' }
      ];
      setAutoScalingEnabled(true);
    }

    setFailedServerId(targetId);
    
    // Update instances: targetId fails, other instances take 50% traffic
    const updated = instances.map(inst => {
      if (inst.id === targetId) {
        return {
          ...inst,
          status: 'failed',
          cpu: 0,
          requests: 0,
          trafficShare: 0
        };
      }
      return {
        ...inst,
        status: 'healthy',
        cpu: 59,
        requests: 175,
        trafficShare: 50
      };
    });

    setServerInstances(updated);
    setSystemStatus('AVAILABLE'); // Kept available because other instances continue running!
    setResponseTime(85);

    addLog(`ALERT: Backend Instance ${targetId} health-check failed (Connection Timed Out). Server ${targetId} is unavailable.`, 'danger');
    addLog(`FAILOVER: Load Balancer drained connections from Instance ${targetId}. Traffic rerouted to Instance 1 (50%) and Instance 3 (50%).`, 'warning');
    addLog('High Availability Maintained: Service remains 100% AVAILABLE with 0 dropped viewer connections.', 'success');
  };

  // Recover Failed Server
  const recoverServer = (targetId = 2) => {
    setFailedServerId(null);
    setServerInstances(prev => prev.map(inst => {
      if (inst.id === targetId) {
        return {
          ...inst,
          status: 'healthy',
          cpu: 50,
          requests: 115,
          trafficShare: 33
        };
      }
      return {
        ...inst,
        cpu: 52,
        requests: 115,
        trafficShare: 33
      };
    }));
    setSystemStatus('HEALTHY');
    addLog(`Self-Healing / Pod restarted: Backend Instance ${targetId} recovered and passed health checks. Re-joined pool.`, 'success');
  };

  // Automated CI/CD Deployment Simulation
  const deployNewVersion = () => {
    if (isDeploying) return;
    setIsDeploying(true);
    setDeploymentProgress(0);
    setDeploymentStatus('preparing');

    addLog('CI/CD Pipeline triggered for commit #3f8a91 (v1.1.0 update)...', 'info');

    // Step 1: Preparing
    setTimeout(() => {
      setDeploymentProgress(18);
      setDeploymentStatus('testing');
      addLog('Step 2/6: Running automated unit and integration test suites (128 tests passing)...', 'info');

      // Step 2: Testing
      setTimeout(() => {
        setDeploymentProgress(40);
        setDeploymentStatus('building');
        addLog('Step 3/6: Building production Docker container image with optimized video transcoders...', 'info');

        // Step 3: Building
        setTimeout(() => {
          setDeploymentProgress(65);
          setDeploymentStatus('deploying');
          addLog('Step 4/6: Rolling deployment in progress. Replacing backend containers one-by-one with zero downtime...', 'info');

          // Step 4: Deploying
          setTimeout(() => {
            setDeploymentProgress(88);
            setDeploymentStatus('healthcheck');
            addLog('Step 5/6: Automated health checks verifying HTTP 200 OK and stream playback on new version...', 'info');

            // Step 5: Complete
            setTimeout(() => {
              setDeploymentProgress(100);
              setDeploymentStatus('complete');
              setIsDeploying(false);
              setApplicationVersion('v1.1.0');
              addLog('Step 6/6: Deployment SUCCESSFUL! Upgraded to v1.1.0. Total downtime: 0 seconds.', 'success');
            }, 1200);
          }, 1300);
        }, 1200);
      }, 1200);
    }, 1000);
  };

  // Reset Simulation
  const resetSimulation = () => {
    setTrafficLevel(INITIAL_STATE.trafficLevel);
    setActiveUsers(INITIAL_STATE.activeUsers);
    setRequestsPerSecond(INITIAL_STATE.requestsPerSecond);
    setCpuUsage(INITIAL_STATE.cpuUsage);
    setMemoryUsage(INITIAL_STATE.memoryUsage);
    setResponseTime(INITIAL_STATE.responseTime);
    setServerInstances([
      {
        id: 1,
        name: 'Backend Instance 1',
        status: 'healthy',
        cpu: 30,
        memory: 40,
        requests: 20,
        trafficShare: 100,
        port: 8081,
        zone: 'us-east-1a'
      }
    ]);
    setAutoScalingEnabled(false);
    setAutoScalingStep(null);
    setIsScalingInProgress(false);
    setDeploymentStatus('idle');
    setDeploymentProgress(0);
    setIsDeploying(false);
    setApplicationVersion('v1.0.0');
    setSystemStatus('HEALTHY');
    setFailedServerId(null);
    setActivityLogs([
      {
        id: Date.now(),
        timestamp: getTimestamp(),
        message: 'Simulation reset to baseline state (1 instance, 100 users, 30% CPU, v1.0.0).',
        type: 'info'
      }
    ]);
  };

  const togglePresentationMode = () => {
    setPresentationMode(prev => !prev);
  };

  return (
    <SimulationContext.Provider
      value={{
        backendStatus,
        backendDiagnostics,
        lastHealthCheckTime,
        catalogVideos,
        catalogLoading,
        catalogError,
        refreshHealth,
        refreshCatalog,
        trafficLevel,
        activeUsers,
        requestsPerSecond,
        cpuUsage,
        memoryUsage,
        responseTime,
        serverInstances,
        autoScalingEnabled,
        autoScalingStep,
        isScalingInProgress,
        deploymentStatus,
        deploymentProgress,
        isDeploying,
        applicationVersion,
        systemStatus,
        presentationMode,
        activityLogs,
        metricsHistory,
        failedServerId,
        setNormalTraffic,
        increaseTraffic,
        increaseExtremeTraffic,
        enableAutoScaling,
        simulateServerFailure,
        recoverServer,
        deployNewVersion,
        resetSimulation,
        togglePresentationMode,
        addLog
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}
