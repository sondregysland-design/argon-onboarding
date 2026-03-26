import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h2 className="text-4xl font-bold text-navy-900 mb-4">404</h2>
      <p className="text-gray-500 mb-6">Siden du leter etter finnes ikke.</p>
      <Link href="/" className="text-navy-900 underline hover:text-navy-700">
        Gå tilbake til forsiden
      </Link>
    </div>
  );
}
