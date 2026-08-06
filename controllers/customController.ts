import { Request, Response } from 'express';

export const getCustomData = async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Data fetched successfully",
    count: 0,
    data: []
  });
};
