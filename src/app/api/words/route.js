import { NextResponse } from 'next/server';

export async function GET() {
  const words = [
    {
      id: 1,
      image: '/cat.png',
      answer: 'CAT',
      options: ['G', 'B', 'D', 'F', 'I', 'J']
    },
    {
      id: 2,
      image: '/dog.png',
      answer: 'DOG',
      options: ['O', 'P', 'D', 'G', 'H', 'K']
    },
    // Add more words
  ];

  return NextResponse.json(words);
}
