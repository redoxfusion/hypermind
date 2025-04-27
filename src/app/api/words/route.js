import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const words = await prisma.word.findMany();
      res.status(200).json(words);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch words" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
