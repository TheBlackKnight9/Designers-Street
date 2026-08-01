"""
Generate fashion lookbook MP4s (9:16) with distinct music beds for Designer's Street.
"""
from __future__ import annotations

import subprocess
from pathlib import Path

from imageio_ffmpeg import get_ffmpeg_exe

OUT = Path(__file__).resolve().parents[1] / "public" / "videos"
FF = get_ffmpeg_exe()
DURATION = 6
FONT = "C\\\\:/Windows/Fonts/arial.ttf"


def run(cmd: list[str]) -> None:
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr[-1800:])
        raise SystemExit(r.returncode)


def make_title_clip(
    filename: str,
    title: str,
    bg: str,
    accent: str,
    freqs: list[float],
    *,
    tremolo: str | None = None,
    volume: float = 0.3,
) -> None:
    out = OUT / filename
    d = DURATION
    fade = d - 1
    safe = title.replace(":", "\\:")

    # Build lavfi graph as one filter_complex string
    # Video: color -> boxes -> text -> fade
    # Audio: sine mix
    vchain = (
        f"color=c={bg}:s=720x1280:d={d}[bg];"
        f"[bg]drawbox=x=36:y=36:w=648:h=1208:color={accent}@0.22:t=8[box];"
        f"[box]drawtext=fontfile={FONT}:text='{safe}':fontsize=44:fontcolor={accent}:"
        f"x=(w-text_w)/2:y=(h-text_h)/2-40[t1];"
        f"[t1]drawtext=fontfile={FONT}:text='LOOKBOOK':fontsize=22:fontcolor=white@0.8:"
        f"x=(w-text_w)/2:y=(h-text_h)/2+20[t2];"
        f"[t2]fade=t=in:st=0:d=0.4,fade=t=out:st={fade}:d=0.8,format=yuv420p[vout]"
    )

    parts = [f"sine=frequency={f}:duration={d}[a{i}]" for i, f in enumerate(freqs)]
    labels = "".join(f"[a{i}]" for i in range(len(freqs)))
    amix = f"{labels}amix=inputs={len(freqs)}:duration=first,volume={volume}"
    if tremolo:
        amix += f",{tremolo}"
    amix += f",afade=t=in:st=0:d=0.5,afade=t=out:st={fade}:d=0.8[aout]"

    filter_complex = vchain + ";" + ";".join(parts) + ";" + amix

    cmd = [
        FF,
        "-y",
        "-filter_complex",
        filter_complex,
        "-map",
        "[vout]",
        "-map",
        "[aout]",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-t",
        str(d),
        "-movflags",
        "+faststart",
        str(out),
    ]
    print(">", filename)
    run(cmd)
    print(" ", out.stat().st_size, "bytes")


def remix(
    src_name: str,
    dest_name: str,
    freqs: list[float],
    *,
    tremolo: str | None = None,
    volume: float = 0.3,
) -> None:
    src = OUT / src_name
    dest = OUT / dest_name
    if not src.exists():
        print("skip", src_name)
        return
    d = DURATION
    fade = d - 1

    parts = [f"sine=frequency={f}:duration={d}[a{i}]" for i, f in enumerate(freqs)]
    labels = "".join(f"[a{i}]" for i in range(len(freqs)))
    amix = f"{labels}amix=inputs={len(freqs)}:duration=first,volume={volume}"
    if tremolo:
        amix += f",{tremolo}"
    amix += f",afade=t=in:st=0:d=0.4,afade=t=out:st={fade}:d=0.7[aout]"
    filter_complex = ";".join(parts) + ";" + amix

    cmd = [
        FF,
        "-y",
        "-stream_loop",
        "-1",
        "-i",
        str(src),
        "-filter_complex",
        filter_complex,
        "-map",
        "0:v",
        "-map",
        "[aout]",
        "-t",
        str(d),
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-shortest",
        "-movflags",
        "+faststart",
        str(dest),
    ]
    print("> remix", dest_name)
    run(cmd)
    print(" ", dest.stat().st_size, "bytes")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    make_title_clip("fashion-runway-noir.mp4", "NOIR RUNWAY", "0x0d0d0d", "0xc9a87c", [110, 165, 220], volume=0.35)
    make_title_clip("fashion-bridal-gold.mp4", "BRIDAL GOLD", "0x1a1208", "0xd4af37", [261.63, 329.63, 392], volume=0.28)
    make_title_clip("fashion-atelier-silk.mp4", "ATELIER SILK", "0x2a1f1a", "0xe8d5c4", [196, 247, 294, 370], volume=0.25)
    make_title_clip(
        "fashion-street-pulse.mp4",
        "STREET PULSE",
        "0x111827",
        "0x38bdf8",
        [90, 180, 540],
        tremolo="tremolo=f=4:d=0.65",
        volume=0.32,
    )
    make_title_clip(
        "fashion-couture-waltz.mp4",
        "COUTURE WALTZ",
        "0x1f1235",
        "0xf5d0fe",
        [293.66, 349.23, 440],
        tremolo="tremolo=f=1.5:d=0.4",
        volume=0.3,
    )
    make_title_clip("fashion-heritage.mp4", "HERITAGE", "0x3b1f0f", "0xfbbf24", [130.81, 164.81, 196], volume=0.34)
    make_title_clip(
        "fashion-tokyo-neon.mp4",
        "TOKYO NEON",
        "0x050510",
        "0x22d3ee",
        [220, 330, 880],
        tremolo="tremolo=f=8:d=0.7",
        volume=0.26,
    )
    make_title_clip("fashion-minimal-white.mp4", "MINIMAL", "0xf5f0e8", "0x1c1917", [523.25, 659.25], volume=0.18)
    make_title_clip("fashion-velvet-night.mp4", "VELVET NIGHT", "0x1e1030", "0xa78bfa", [98, 147, 196], volume=0.38)
    make_title_clip(
        "fashion-garden-bloom.mp4",
        "GARDEN BLOOM",
        "0x0f2a1a",
        "0x86efac",
        [349.23, 440, 523.25],
        tremolo="tremolo=f=2:d=0.35",
        volume=0.22,
    )
    make_title_clip("fashion-groom-edit.mp4", "GROOM EDIT", "0x121212", "0xe5e5e5", [146.83, 220, 293.66], volume=0.3)
    make_title_clip(
        "fashion-festive-saree.mp4",
        "FESTIVE SAREE",
        "0x4a0519",
        "0xfcd34d",
        [311.13, 392, 466.16],
        tremolo="tremolo=f=3:d=0.5",
        volume=0.3,
    )

    remix("lookbook-vertical-9x16.mp4", "lookbook-vertical-scored.mp4", [196, 247, 311], tremolo="tremolo=f=2.5:d=0.45")
    remix("runway-spotlight.mp4", "runway-spotlight-scored.mp4", [130, 196, 262])
    remix("atelier-fabric.mp4", "atelier-fabric-scored.mp4", [220, 277, 330], tremolo="tremolo=f=1.2:d=0.5")
    remix("couture-motion.mp4", "couture-motion-scored.mp4", [174, 220, 349])

    print("Done ->", OUT)


if __name__ == "__main__":
    main()
