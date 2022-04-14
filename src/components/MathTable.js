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
  const [words, setWords] = useState([]);
  const [numbers, setNumbers] = useState([]);
  const [results, setResults] = useState([]);
  const [operators] = useState(["minus", "plus", "times", "divided by"]);
  const [loading, setLoading] = useState(true);
  const [loading1, setLoading1] = useState(true);
  const [loading2, setLoading2] = useState(true);

  useEffect(() => {
    setLoading(true);

    fetchNumbers();

    async function fetchNumbers() {
      setNumbers([]);
      setWords([]);
      setLoading1(true);
      const DATA = await fetch(API1, { method: "GET" });
      const body = await DATA.json();
      let tempArray = [];
      let tempArray1 = [];
      Object.values(body).forEach((value) => {
        tempArray.push(wordToNumber(value));
        tempArray1.push(value);
      });
      setWords(tempArray1);
      setNumbers(tempArray);

      setLoading1(false);
    }
  }, []);

  useEffect(() => {
    setResults([]);
    fetchOperationResults();

    async function fetchOperationResults() {
      
      if (numbers.length > 0) {
        for (let operator of operators) {
          setLoading2(true);
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
          setResults((results) => [...results, element]);
          setLoading2(false);
        }
        setLoading(false);
      }
    }
  }, [numbers, operators]);

  return (
    <>
      <div className="console">
        <h2>Mock Console <span style={{fontSize:12}}>Press F5 for a new set of numbers</span></h2>

        <ul>
          <li>
            Fetching and converting word numbers:
            {loading1 && (
              <CircularProgress
                size={12}
                sx={{
                  color: "black",

                  marginTop: "-12px",
                  marginLeft: "5px",
                }}
              />
            )}
            <ul>
              {words[0] && (
                <li>
                  {words[0]} -> {numbers[0]}
                </li>
              )}
              {words[1] && (
                <li>
                  {words[1]} -> {numbers[1]}
                </li>
              )}
            </ul>
          </li>

          {!loading1 && (
            <li>
              Fetching result for each operation
              {loading2 && (
                <CircularProgress
                  size={12}
                  sx={{
                    color: "black",

                    marginTop: "-12px",
                    marginLeft: "5px",
                  }}
                />
              )}
              <ul>
                {results.map((el, i) => {
                  return (
                    <li key={i}>
                      {el?.operation} -> {el?.result}
                    </li>
                  );
                })}
              </ul>
            </li>
          )}
          {!loading1 && !loading2 && (
            <li>
              {loading ? (
                <span>
                  Inserting data into table
                  <CircularProgress
                    size={12}
                    sx={{
                      color: "black",

                      marginTop: "-12px",
                      marginLeft: "5px",
                    }}
                  />
                </span>
              ) : (
                "Done"
              )}
            </li>
          )}
        </ul>
      </div>
      <div className="main">
        <DataGrid
          rows={results}
          columns={columns}
          pageSize={4}
          rowsPerPageOptions={[4]}
        />
      </div>
    </>
  );
};

export default MathTable;
