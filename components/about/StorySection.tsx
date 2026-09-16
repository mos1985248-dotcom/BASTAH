// components/about/StorySection.tsx

import { t } from "@/theme";

export default function StorySection({
  title,
  children,
  alt = false,
  id,
}: {
  title?: string;
  children: React.ReactNode;
  alt?: boolean;
  id?: string;
}) {
  return (
    <section
      id={id}
      style={{
        background: alt ? t.colors.cream.warm : "transparent",
        padding: `${t.spacing["16"]} ${t.spacing["5"]}`,
        direction: "rtl",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 820,
          margin: "0 auto",
        }}
      >
        {title && (
          <h2
            style={{
              margin: `0 0 ${t.spacing["5"]}`,
              color: t.colors.text.dark,
              fontSize: t.typography.fontSize["2xl"],
              fontWeight: t.typography.fontWeight.bold,
              lineHeight: 1.5,
            }}
          >
            {title}
          </h2>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: t.spacing["4"],
            color: t.colors.text.body,
            fontSize: t.typography.fontSize.base,
            lineHeight: 2,
          }}
        >
          {children}
        </div>
      </div>
    </section>
  );
}