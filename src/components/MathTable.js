import { useEffect, useState } from "react";
import { wordToNumber } from "../utils/WordToNumberConverter";
import { DataGrid } from "@mui/x-data-grid";
import { CircularProgress } from "@mui/material";

const API1 = "https://100insure.com/mi/api1.php";
const API2 = "https://100insure.com/mi/api2.php";

const columns = [
  { field: "num1", headerName: "First Number", width: 120 },
  { field: "operation", headerName: "Operator", width: 100 },
  { field: "num2", headerName: "Second Number", width: 140 },
  { field: "result", headerName: "Result", width: 100 },
];

const MathTable = () => {
  const [numbers, setNumbers] = useState([]);
  const [results, setResults] = useState([]);
  const [operators] = useState(["minus", "plus", "times", "divided by"]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchNumbers();

    async function fetchNumbers() {
      const DATA = await fetch(API1, { method: "GET" });
      const body = await DATA.json();
      let tempArray = [];
      Object.values(body).forEach((value) => {
        tempArray.push(wordToNumber(value));
      });
      setNumbers(tempArray);
    }
  }, []);

  useEffect(() => {
    fetchOperationResults();

    async function fetchOperationResults() {
      let tempResults = [];
      if (numbers.length > 0) {
        for (let operator of operators) {
          let DATA = await fetch(API2, {
            method: "POST",
            body: JSON.stringify({
              num1: numbers[0],
              num2: numbers[1],
              operation: operator,
            }),
          });
          let body = await DATA.json();
          if (operator === "divided by") {
            body = Number(body.toFixed(3));
          }
          let element = {
            id: operator,
            num1: numbers[0],
            num2: numbers[1],
            operation: operator,
            result: body,
          };
          tempResults.push(element);
        }
        console.log(tempResults)
        setResults(tempResults);
        setLoading(false);
      }
    }
  }, [numbers, operators]);

  console.log(results)
  return (
    <div className="main">
      <DataGrid
        rows={results}
        columns={columns}
        pageSize={4}
        rowsPerPageOptions={[4]}
      />
      {loading && (
        <CircularProgress
          size={24}
          sx={{
            color: "black",
            position: "absolute",
            top: "50%",
            left: "50%",
            marginTop: "-12px",
            marginLeft: "-12px",
          }}
        />
      )}
    </div>
  );
};

export default MathTable;
