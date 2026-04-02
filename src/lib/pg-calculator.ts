import { PGConfig, ServerSpecs, WorkloadType, StorageType, PgBouncerConfig } from '../types';

const getWorkloadMultiplier = (workload: WorkloadType) => {
  const multipliers = {
    mixed: {
      shared_buffers: 0.25,
      maintenance_work_mem: 0.05,
      checkpoint_target: 0.9,
      checkpoint_timeout: '15min',
      autovacuum: 'on',
      autovacuum_naptime: '1min',
      vacuum_cost_limit: 200,
    },
    oltp: {
      shared_buffers: 0.2,
      maintenance_work_mem: 0.03,
      checkpoint_target: 0.7,
      checkpoint_timeout: '5min',
      autovacuum: 'on',
      autovacuum_naptime: '30s',
      vacuum_cost_limit: 400,
    },
    analytics: {
      shared_buffers: 0.4,
      maintenance_work_mem: 0.1,
      checkpoint_target: 0.9,
      checkpoint_timeout: '30min',
      autovacuum: 'off',
      autovacuum_naptime: '10min',
      vacuum_cost_limit: 2000,
    },
    web: {
      shared_buffers: 0.25,
      maintenance_work_mem: 0.04,
      checkpoint_target: 0.8,
      checkpoint_timeout: '10min',
      autovacuum: 'on',
      autovacuum_naptime: '1min',
      vacuum_cost_limit: 300,
    },
    desktop: {
      shared_buffers: 0.1,
      maintenance_work_mem: 0.02,
      checkpoint_target: 0.5,
      checkpoint_timeout: '2min',
      autovacuum: 'on',
      autovacuum_naptime: '5min',
      vacuum_cost_limit: 100,
    },
  };

  return multipliers[workload] || multipliers.mixed;
};

const getStorageMultiplier = (storage: StorageType) => {
  const multipliers = {
    ssd: {
      random_page_cost: 1.1,
      effective_io_concurrency: 200,
      seq_page_cost: 1.0,
    },
    hdd: {
      random_page_cost: 4.0,
      effective_io_concurrency: 2,
      seq_page_cost: 1.0,
    },
    network: {
      random_page_cost: 2.0,
      effective_io_concurrency: 100,
      seq_page_cost: 1.0,
    },
  };

  return multipliers[storage] || multipliers.ssd;
};

const calculatePgBouncer = (specs: ServerSpecs): PgBouncerConfig => {
  const { concurrency, vcpu } = specs;
  
  return {
    listen_addr: '0.0.0.0',
    listen_port: 6432,
    auth_type: 'md5',
    auth_file: '/etc/pgbouncer/userlist.txt',
    logfile: '/var/log/pgbouncer/pgbouncer.log',
    pidfile: '/var/run/pgbouncer/pgbouncer.pid',
    admin_users: 'pgbouncer',
    pool_mode: specs.workload === 'analytics' ? 'session' : 'transaction',
    max_client_conn: concurrency * 10,
    default_pool_size: Math.max(20, vcpu * 5),
    min_pool_size: Math.max(15, vcpu * 3),
    reserve_pool_size: Math.max(20, vcpu * 2),
    reserve_pool_timeout: 5,
    server_idle_timeout: 300,
    query_timeout: 120,
    idle_transaction_timeout: 300,
    tcp_keepalive: 1,
  };
};

export const calculatePGConfig = (specs: ServerSpecs): PGConfig => {
  const { vcpu, ram, concurrency, workload, storage } = specs;
  const ramMB = ram * 1024;
  
  const workloadMultiplier = getWorkloadMultiplier(workload);
  const storageMultiplier = getStorageMultiplier(storage);

  // Connection settings
  const max_connections = Math.min(concurrency + 20, 1000);
  const superuser_reserved_connections = Math.max(3, Math.min(10, Math.floor(max_connections * 0.1)));

  // Memory settings
  const shared_buffers_val = Math.floor(ramMB * workloadMultiplier.shared_buffers);
  const work_mem_val = Math.max(4, Math.floor((ramMB * 0.25) / max_connections));
  const maintenance_work_mem_val = Math.floor(ramMB * workloadMultiplier.maintenance_work_mem);
  const effective_cache_size_val = Math.floor(ramMB * 0.75);
  const temp_buffers_val = Math.max(8, Math.floor(ramMB * 0.02));

  // WAL and Checkpoint settings
  const wal_buffers_val = Math.min(64, Math.max(16, Math.floor(shared_buffers_val / 32)));
  const max_wal_size_val = Math.max(1024, Math.floor(ramMB * 0.1));
  const min_wal_size_val = Math.floor(max_wal_size_val / 4);

  return {
    max_connections,
    superuser_reserved_connections,
    shared_buffers: `${shared_buffers_val}MB`,
    work_mem: `${work_mem_val}MB`,
    maintenance_work_mem: `${maintenance_work_mem_val}MB`,
    effective_cache_size: `${effective_cache_size_val}MB`,
    temp_buffers: `${temp_buffers_val}MB`,
    wal_buffers: `${wal_buffers_val}MB`,
    max_wal_size: `${max_wal_size_val}MB`,
    min_wal_size: `${min_wal_size_val}MB`,
    checkpoint_completion_target: workloadMultiplier.checkpoint_target,
    checkpoint_timeout: workloadMultiplier.checkpoint_timeout,
    wal_level: workload === 'analytics' ? 'replica' : 'minimal',
    synchronous_commit: workload === 'oltp' ? 'on' : 'off',
    max_worker_processes: Math.min(vcpu * 2, 64),
    max_parallel_workers: Math.min(vcpu, 64),
    max_parallel_workers_per_gather: Math.min(Math.floor(vcpu / 2), 16),
    max_parallel_maintenance_workers: Math.min(Math.floor(vcpu / 2), 4),
    autovacuum: workloadMultiplier.autovacuum,
    autovacuum_max_workers: Math.min(10, Math.max(3, Math.floor(vcpu / 2))),
    autovacuum_naptime: workloadMultiplier.autovacuum_naptime,
    autovacuum_vacuum_cost_limit: workloadMultiplier.vacuum_cost_limit,
    autovacuum_vacuum_scale_factor: workload === 'analytics' ? 0.2 : 0.05,
    autovacuum_analyze_scale_factor: workload === 'analytics' ? 0.1 : 0.02,
    random_page_cost: storageMultiplier.random_page_cost,
    effective_io_concurrency: storageMultiplier.effective_io_concurrency,
    seq_page_cost: storageMultiplier.seq_page_cost,
    default_statistics_target: workload === 'analytics' ? 500 : 100,
    constraint_exclusion: 'partition',
    cursor_tuple_fraction: workload === 'analytics' ? 0.1 : 0.05,
    deadlock_timeout: workload === 'oltp' ? '1s' : '5s',
    max_locks_per_transaction: workload === 'analytics' ? 128 : 64,
    pgbouncer: calculatePgBouncer(specs),
  };
};
