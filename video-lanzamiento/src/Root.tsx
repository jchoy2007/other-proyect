import React from "react";
import { Composition } from "remotion";
import { DURACION, Lanzamiento } from "./Video";

export const Root: React.FC = () => (
  <>
    {/* Reels / TikTok / Stories */}
    <Composition id="Lanzamiento-Vertical" component={Lanzamiento} durationInFrames={DURACION} fps={30} width={1080} height={1920} />
    {/* YouTube / página web */}
    <Composition id="Lanzamiento-Horizontal" component={Lanzamiento} durationInFrames={DURACION} fps={30} width={1920} height={1080} />
  </>
);
