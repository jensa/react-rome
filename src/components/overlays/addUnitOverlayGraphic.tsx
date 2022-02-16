import "./animations.css";

const AddUnitOverlayGraphic: React.FC<{
  style?: React.CSSProperties;
}> = ({ style }) => {
  return (
    <div
      className="growing-shrinking-small"
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,200, 0, 0.5)",

        ...style,
      }}
    ></div>
  );
};

export default AddUnitOverlayGraphic;
