import { useEffect, useRef } from "react";
import { PatternPart } from "../battleState";
import { keyString } from "../util";

export type BattleLogEntry = {
  unitId?: number;
  affectedUnitId?: number;
  move?: PatternPart[];
  attack?: PatternPart[];
  message?: string;
};

const BattleLog: React.FC<{
  log: BattleLogEntry[];
  style?: React.CSSProperties;
}> = ({ log, style }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [log]);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        border: "1px dotted black",
        overflow: "scroll",
        paddingLeft: "5px",
        paddingRight: "5px",
        ...style,
      }}
    >
      {log.map((l) => (
        <p style={{ borderBottom: "1px solid black" }} key={keyString()}>
          {l.message}
        </p>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default BattleLog;
