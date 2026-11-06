"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import s from "./hero.module.css";

const POSTER = "/images/bastah-heritage-hero-poster.webp";
const VIDEO = "/videos/bastah-heritage-hero.mp4";
type Connection = EventTarget & { saveData?: boolean };

export default function HeroVisual() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [imageReady, setImageReady] = useState(false);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const enableVideo = imageReady && motionAllowed && !failed;

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    const update = () => setMotionAllowed(!reducedMotion.matches && !connection?.saveData);
    update();
    reducedMotion.addEventListener("change", update);
    connection?.addEventListener("change", update);
    return () => {
      reducedMotion.removeEventListener("change", update);
      connection?.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !enableVideo) return;
    let visible = false;
    const syncPlayback = () => {
      if (visible && !document.hidden) {
        void video.play().catch(() => {
          // A blocked autoplay leaves the still image visible.
        });
      } else video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    });
    observer.observe(video);
    document.addEventListener("visibilitychange", syncPlayback);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      video.pause();
    };
  }, [enableVideo]);

  return (
    <div className={s.visual}>
      <Image
        src={POSTER}
        alt="مشاهد من سوق سعودي تراثي عند الغروب"
        fill
        priority
        sizes="(max-width: 767px) 100vw, 50vw"
        className={s.image}
        onLoad={() => setImageReady(true)}
      />
      <video
        ref={videoRef}
        src={enableVideo ? VIDEO : undefined}
        poster={POSTER}
        className={`${s.video} ${enableVideo && videoReady ? s.videoReady : ""}`}
        autoPlay={enableVideo}
        muted
        loop
        playsInline
        preload="none"
        disablePictureInPicture
        aria-hidden="true"
        tabIndex={-1}
        onPlaying={() => setVideoReady(true)}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
