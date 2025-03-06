import React from "react";
import { utils } from "../utils/functionUtils";
const Timeline = (props) => {
  const styles = {
    timeline: {
      display: "flex",
      flexDirection: "column",
      position: "relative",
      paddingLeft: "20px",
      margin: "20px 0",
    },
    timelineLine: {
      content: '""',
      position: "absolute",
      top: "5px",
      bottom: 0,
      width: "2px",
      backgroundColor: "#dcdcdc",
    },
    timelineItem: {
      display: "flex",
      alignItems: "flex-start",
      marginBottom: "20px",
      position: "relative",
    },
    timelineCircle: {
      width: "14px",
      height: "12px",
      maxWidth: "12px",
      border: "2px solid #7e7e7e",
      borderRadius: "50%",
      backgroundColor: "white",
      position: "relative",
      top: "5px",
      left: "-5px",
    },
    timelineContent: {
      marginLeft: "15px",
    },
    title: {
      fontSize: "16px",
      margin: "0",
      color: "#333",
    },
    time: {
      fontSize: "14px",
      color: "#888",
    },
  };

  return (
    <div style={styles.timeline}>
      {props?.timeline && props?.timeline?.length > 0 ? (
        <>
          <div style={styles.timelineLine}></div>
          {props?.timeline.map((item, index) => (
            <div style={styles.timelineItem} key={index}>
              <div style={styles.timelineCircle}></div>
              <div style={styles.timelineContent}>
                <h3 style={styles.title}>{item?.stage || ""}</h3>
                <span style={styles.time}>
                  {utils.formatDateTime(item?.updated_at) || ""}
                </span>
                <div style={styles.description}>
                  {item?.status || "No Status Available"}
                </div>
              </div>
            </div>
          ))}
        </>
      ) : (
        <p>No timeline data available.</p>
      )}
    </div>
  );
};

export default Timeline;
