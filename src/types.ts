export type WorkloadType = 'mixed' | 'oltp' | 'analytics' | 'web' | 'desktop';
export type StorageType = 'ssd' | 'hdd' | 'network';
export type OSType = 'linux' | 'windows' | 'macos';
export type ArchType = 'x86_64' | 'arm64';
export type PoolMode = 'session' | 'transaction' | 'statement';

export interface ServerSpecs {
  os: OSType;
  arch: ArchType;
  vcpu: number;
  ram: number; // in GB
  concurrency: number;
  workload: WorkloadType;
  storage: StorageType;
  pgVersion: number;
}

export interface PgBouncerConfig {
  listen_addr: string;
  listen_port: number;
  auth_type: string;
  auth_file: string;
  logfile: string;
  pidfile: string;
  admin_users: string;
  pool_mode: PoolMode;
  max_client_conn: number;
  default_pool_size: number;
  min_pool_size: number;
  reserve_pool_size: number;
  reserve_pool_timeout: number;
  server_idle_timeout: number;
  query_timeout: number;
  idle_transaction_timeout: number;
  tcp_keepalive: number;
}

export interface ConfigItem {
  name: string;
  value: string | number;
  description?: string;
}

export interface ConfigGroup {
  title: string;
  icon: string;
  items: ConfigItem[];
}

export interface PGConfig {
  max_connections: number;
  superuser_reserved_connections: number;
  shared_buffers: string;
  work_mem: string;
  maintenance_work_mem: string;
  effective_cache_size: string;
  temp_buffers: string;
  wal_buffers: string;
  max_wal_size: string;
  min_wal_size: string;
  checkpoint_completion_target: number;
  checkpoint_timeout: string;
  wal_level: string;
  synchronous_commit: string;
  max_worker_processes: number;
  max_parallel_workers: number;
  max_parallel_workers_per_gather: number;
  max_parallel_maintenance_workers: number;
  autovacuum: string;
  autovacuum_max_workers: number;
  autovacuum_naptime: string;
  autovacuum_vacuum_cost_limit: number;
  autovacuum_vacuum_scale_factor: number;
  autovacuum_analyze_scale_factor: number;
  random_page_cost: number;
  effective_io_concurrency: number;
  seq_page_cost: number;
  default_statistics_target: number;
  constraint_exclusion: string;
  cursor_tuple_fraction: number;
  deadlock_timeout: string;
  max_locks_per_transaction: number;
  pgbouncer?: PgBouncerConfig;
}
