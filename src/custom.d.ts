declare namespace Express {
  export interface User {
    id: number;
  }

  export interface Request {
    pagination: {
      size: number,
      number: number,
      records: number,
    };
  }
}
