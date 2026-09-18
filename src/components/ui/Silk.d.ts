declare module '@/components/ui/Silk' {
  import type { FC } from 'react';
  interface SilkProps {
    speed?: number;
    scale?: number;
    color?: string;
    noiseIntensity?: number;
    rotation?: number;
    lightMode?: boolean;
  }
  const Silk: FC<SilkProps>;
  export default Silk;
}
