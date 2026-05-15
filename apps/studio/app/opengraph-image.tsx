import { ImageResponse } from "next/og";
import { SocialImage, socialImageAlt, socialImageContentType, socialImageSize } from "./social-image";

export const alt = socialImageAlt;
export const size = socialImageSize;
export const contentType = socialImageContentType;

export default function OpenGraphImage() {
  return new ImageResponse(<SocialImage />, size);
}
