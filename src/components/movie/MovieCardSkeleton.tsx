export default function MovieCardSkeleton() {
  return (
    <div className="w-full">
      {/* 16:9 image placeholder */}
      <div
        className="w-full animate-pulse bg-white/8 rounded-[14px]"
        style={{ aspectRatio: '16/9' }}
      />
      {/* Metadata placeholder */}
      <div className="mt-2.5 px-0.5 space-y-1.5">
        <div className="h-3.5 bg-white/8 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-white/6 rounded animate-pulse w-1/2" />
      </div>
    </div>
  );
}
