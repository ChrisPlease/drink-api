import { Pool } from 'pg';
import { config } from './config/db.config'

export const pool = new Pool(config)
