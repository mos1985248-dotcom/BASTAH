import s from "./merchant-tools.module.css";

export default function MerchantToolCopy({ desktop, mobile }: { desktop: string; mobile: string }) {
  return (
    <>
      <span className={s.desktopCopy}>{desktop}</span>
      <span className={s.mobileCopy}>{mobile}</span>
    </>
  );
}
