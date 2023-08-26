import React, { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [contributionsData, setContributionsData] = useState({});
  const [tooltipContent, setTooltipContent] = useState({});
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipVisible, setTooltipVisible] = useState(false);

  useEffect(()=> {
    axios('https://dpg.gg/test/calendar.json')
    .then(({data}) => {setContributionsData(data)})
  }, [])

  const daysOfWeek = ['Пн', '', 'Ср', '', 'Пт', '', ''];

  const getColorForCount = (count) => {
    if (count === 0) return "#EDEDED";
    if (count >= 1 && count <= 9) return "#ACD5F2";
    if (count >= 10 && count <= 19) return "#7FA8C9";
    if (count >= 20 && count <= 29) return "#527BA0";
    return "#254E77";
  };

  const handleCellClick = (event, count, date) => {
    const cellPosition = event.target.getBoundingClientRect();
    const [year, month, day] = date.split('-').map(Number);
    console.log(date);

    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      const dateObject = new Date(year, month - 1, day);
      const weekdays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
      const formattedDate = `${weekdays[dateObject.getDay()]}, ${dateObject.toLocaleString('ru-RU', { month: 'long' })}, ${dateObject.getDate()}, ${dateObject.getFullYear()}`;
      setTooltipContent(<>
        <h3>{count} contributions</h3>
        <p>{formattedDate}</p>
        </>
      );
      setTooltipPosition({
        top: cellPosition.top,
        left: cellPosition.left + cellPosition.width / 2
      });
      setTooltipVisible(true);
    }
  };


  const handleCellMouseLeave = () => {
    setTooltipVisible(false);
  };

  const createCell = (count, date) => {
    const color = getColorForCount(count);
    return (
      <div
        className="cell"
        style={{ backgroundColor: color }}
        onClick={(e) => handleCellClick(e, count, date)}
        onMouseLeave={handleCellMouseLeave}
      />
    );
  };

  const populateGraph = (data) => {
    let currentDate = new Date();
    let currentMonth = new Date();
    currentMonth.setDate(currentDate.getDate() - 50 * 7)
    const daysUntilMonday = (currentDate.getDay() + 6) % 7; // Количество дней до ближайшего понедельника
    currentDate.setDate(currentDate.getDate() - daysUntilMonday - 50 * 7);

    const rows = [];
    const cellsInColumn = [];
    const monthsRow = [];
    for (let col = 0; col < 12; col++) {
      const monthName = currentMonth.toLocaleString('default', { month: 'short' });
      monthsRow.push(
        <div className="month" key={col}>
          {monthName}
        </div>
      );

      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }
    rows.push(<div className="row months-row" key="months">{monthsRow}</div>);

    for (let col = 0; col < 51; col++) {
      const colCells = [];

      for (let row = 0; row < 7; row++) {
        const dateString = currentDate.toISOString().split("T")[0];
        const contribution = data[dateString] || 0;

        colCells.push(createCell(contribution, dateString));

        currentDate.setDate(currentDate.getDate() + 1);
      }

      cellsInColumn.push(colCells);
    }

    for (let row = 0; row < 7; row++) {
      const rowCells = cellsInColumn.map((colCells) => colCells[row]);
      rows.push(
        <div className="row" key={row}>
          <div className="day-of-week">{daysOfWeek[row]}</div>
          {rowCells}
        </div>
      );
    }

    return rows;
  };


  

  const graphRows = populateGraph(contributionsData);

  return (
    <div className="contribution-graph">
      {graphRows}
      {tooltipVisible && (
        <div
          className="tooltip"
          style={{ top: tooltipPosition.top, left: tooltipPosition.left }}
        >
          {tooltipContent}
        </div>
      )}
    </div>
  );
}

export default App;
