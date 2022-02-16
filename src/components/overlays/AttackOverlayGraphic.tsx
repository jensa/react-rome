import "./animations.css";
import { ReactComponent as BoomGraphic } from "../../svg/overlays/boom.svg";

const AttackOverlayGraphic: React.FC<{
  style?: React.CSSProperties;
}> = ({ style }) => {
  return (
    <div
      className="growing-shrinking-fullsize"
      style={{
        width: "100%",
        height: "100%",

        ...style,
      }}
    >
      <BoomGraphic
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};

export default AttackOverlayGraphic;
