import Image from "next/image";

export default function GameCard({ title, backgroundColor, iconSource, onClick }) {
    return (
      <div
        className="flex flex-col items-center justify-center p-5 rounded-2xl aspect-square cursor-pointer"
        style={{ backgroundColor }}
        onClick={onClick}
      >
        <div className="mb-3">
          <Image src={iconSource} alt={title} width={60} height={60} className="rounded-lg" />
        </div>
        <h3 className="text-sm text-gray-800 font-poppins font-medium text-center">{title}</h3>
      </div>
    );
  }
  