import { hslaDegs } from "../util";

export type TooltipEntity = {
  description: string;
  image?: string;
  color?: string;
};

const TooltipWindow: React.FC<{
  style?: React.CSSProperties;
  activeTooltip?: TooltipEntity;
}> = ({ style, activeTooltip }) => {
  const filterDegs = activeTooltip?.color ? hslaDegs(activeTooltip.color!!) : 0;

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        border: "1px dashed black",
        padding: "5px",
        ...style,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "20px",
      }}
    >
      {activeTooltip?.description && <span>{activeTooltip.description}</span>}
      {activeTooltip?.image && (
        <div
          style={{
            height: "50px",
            width: "50px",
            marginTop: "30px",
            filter: `drop-shadow(2px 2px 2px black) hue-rotate(${filterDegs}deg)`,
          }}
        >
          <img
            style={{ height: "100%", width: "100%" }}
            alt={activeTooltip.description}
            src={activeTooltip.image}
          />
        </div>
      )}
    </div>
  );
};

export default TooltipWindow;
