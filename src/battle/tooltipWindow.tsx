
export type TooltipEntity = {
  description: string;
  image?: string;
};

const TooltipWindow: React.FC<{
  style?: React.CSSProperties;
  activeTooltip?: TooltipEntity;
}> = ({ style, activeTooltip }) => {
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
        <img
          style={{ height: "50px", width: "50px", marginTop: "30px" }}
          alt={activeTooltip.description}
          src={activeTooltip.image}
        />
      )}
    </div>
  );
};

export default TooltipWindow;
