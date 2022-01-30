import { ReactComponent as TurnBallSvg } from "../svg/turn_ball.svg";
import { ReactComponent as HourGlass } from "./hourglass.svg";
import "./turnBall.css";

const TurnBall: React.FC<{
  style?: React.CSSProperties;
  onClick: () => void;
  active: boolean;
}> = ({ style, onClick, active }) => {
  return (
    <div
      onClick={onClick}
      className={active ? "turnball" : ""}
      style={{
        textAlign: "center",
        cursor: "pointer",
        display: "block",
        margin: "auto",
        ...style,
      }}
    >
      <HourGlass
        style={{
          width: "100%",
          height: "100%",
        }}
        fill={active ? "red" : "lightgreen"}
      />
    </div>
  );
};

export default TurnBall;
