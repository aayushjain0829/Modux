import React from 'react';
import './GameGrid.css';

/**
 * GameGrid component standardizes the rendering of grid-based game boards (like Bingo and Cross Clue).
 *
 * Props:
 * - cols (number): Number of columns
 * - rows (number): Number of rows
 * - renderCell (function): (row, col) => JSX for cell
 * - colHeaders (array): Optional array of header objects or render functions for columns
 * - rowHeaders (array): Optional array of header objects or render functions for rows
 * - gap (string): Gap between cells (default: '4px')
 * - maxWidth (string): Max width of the grid container (default: '600px')
 */
const GameGrid = ({
  cols,
  rows,
  renderCell,
  colHeaders,
  rowHeaders,
  gap = '4px',
  maxWidth = '600px'
}) => {
  // Determine if we need an extra column/row for headers
  const hasRowHeaders = rowHeaders && rowHeaders.length > 0;
  const hasColHeaders = colHeaders && colHeaders.length > 0;

  // Build gridTemplateColumns string
  const gridTemplateColumns = hasRowHeaders
    ? `1.2fr repeat(${cols}, 1fr)` // Extra column for row headers
    : `repeat(${cols}, minmax(0, 1fr))`;

  // Build gridTemplateRows string
  const gridTemplateRows = hasColHeaders
    ? `minmax(40px, auto) repeat(${rows}, 1fr)` // Extra row for column headers
    : `repeat(${rows}, 1fr)`;

  return (
    <div
      className="game-grid-container"
      style={{
        gridTemplateColumns,
        gridTemplateRows,
        gap,
        maxWidth
      }}
    >
      {/* Top Left Empty Corner if both row and col headers exist */}
      {hasRowHeaders && hasColHeaders && <div></div>}

      {/* Column Headers */}
      {hasColHeaders &&
        colHeaders.map((headerRender, col) => (
          <React.Fragment key={`col-header-${col}`}>
            {typeof headerRender === 'function' ? headerRender(col) : headerRender}
          </React.Fragment>
        ))}

      {/* Grid Rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <React.Fragment key={`row-${row}`}>
          {/* Row Header */}
          {hasRowHeaders && (
            <React.Fragment key={`row-header-${row}`}>
              {typeof rowHeaders[row] === 'function' ? rowHeaders[row](row) : rowHeaders[row]}
            </React.Fragment>
          )}

          {/* Grid Cells */}
          {Array.from({ length: cols }).map((_, col) => (
            <React.Fragment key={`cell-${row}-${col}`}>
              {renderCell(row, col)}
            </React.Fragment>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default GameGrid;
