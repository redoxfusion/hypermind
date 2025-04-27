import { NextResponse } from 'next/server';

export async function GET() {
  const words = [
    {
      id: 1,
      image: '/cat.png',
      answer: 'CAT',
      options: ['A', 'B', 'D', 'C', 'T', 'J']
    },
    {
      id: 2,
      image: '/dog.png',
      answer: 'DOG',
      options: ['O', 'P', 'D', 'G', 'H', 'K']
    },
    {
      id: 3,
      image: '/fish.png',
      answer: 'FISH',
      options: ['F', 'I', 'S', 'H', 'T', 'U']
    },
    {
      id: 4,
      image: '/bird.png',
      answer: 'BIRD',
      options: ['B', 'I', 'R', 'D', 'E', 'A']
    },
    {
      id: 5,
      image: '/frog.png',
      answer: 'FROG',
      options: ['F', 'R', 'O', 'G', 'H', 'J']
    }
    // Add more words
  ];

  return NextResponse.json(words);
}
