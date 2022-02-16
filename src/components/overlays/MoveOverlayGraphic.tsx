import "./animations.css";
import { ReactComponent as BootGraphic } from "../../svg/overlays/boot.svg";

const MoveOverlayGraphic: React.FC<{
  style?: React.CSSProperties;
}> = ({ style }) => {
  return (
    <div
      className="growing-shrinking-large"
      style={{
        width: "100%",
        height: "100%",

        ...style,
      }}
    >
      <BootGraphic
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};

export default MoveOverlayGraphic;
