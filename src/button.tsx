import React from "react";

const Button: React.FC<{
  onClick: () => void;
  title: string;
  style?: React.CSSProperties;
}> = ({ onClick, title, style }) => {
  return (
    <div
      style={{
        height: "40px",
        width: "100%",
        backgroundColor: "lightgreen",
        border: "1px solid black",
        userSelect: "none",
        cursor: "pointer",
        textAlign: "center",
        lineHeight: "40px",
        ...style,
      }}
      onClick={onClick}
    >
      {title}
    </div>
  );
};

export default Button;
