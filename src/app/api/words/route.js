import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const level = parseInt(searchParams.get('level')) || 1;

    const words = await prisma.word.findMany({
      where: { level },
    });

    return new Response(JSON.stringify(words), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching words:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch words' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}