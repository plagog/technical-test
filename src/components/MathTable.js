import { useEffect, useState } from "react";
import { wordToNumber } from "../utils/WordToNumberConverter";
import { DataGrid } from "@mui/x-data-grid";
import { CircularProgress } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const API1 = "https://100insure.com/mi/api1.php";
const API2 = "https://100insure.com/mi/api2.php";

const operatorSigns = {
  minus: "-",
  plus: "+",
  "divided by": "/",
  times: "*",
};

const columns = [
  { field: "num1", headerName: "First Number", width: 120 },
  { field: "operation", headerName: "Operator", width: 100 },
  { field: "num2", headerName: "Second Number", width: 140 },
  { field: "result", headerName: "Result", width: 100 },
  {
    field: "equation",
    headerName: "Equation",
    description: "Equation represantaion.",
    sortable: false,
    width: 180,
    valueGetter: (params) =>
      `${params.row.num1} ${operatorSigns[params.row.operation]} ${
        params.row.num2
      } = ${params.row.result}`,
  },
];

const MathTable = () => {
  const [words, setWords] = useState([]);
  const [numbers, setNumbers] = useState([]);
  const [results, setResults] = useState([]);
  const [operators] = useState(["minus", "plus", "times", "divided by"]);
  const [loading, setLoading] = useState(true);
  const [loading1, setLoading1] = useState(true);
  const [loading2, setLoading2] = useState(true);

  async function fetchNumbers() {
    setNumbers([]);
    setWords([]);
    setResults([]);
    setLoading(true);
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

  useEffect(() => {
    fetchNumbers();
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

  const reset = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setNumbers([]);
    setWords([]);
    setResults([]);
    fetchNumbers();
  };

  return (
    <>
      <div className="console">
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <span
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                alignItems: "center",
              }}
            >
              <span style={{ display: "flex", alignItems: "center" }}>
                <h2>Mock Console</h2>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: "bold",
                    marginLeft: "10px",
                  }}
                >
                  Press F5 for a new set of numbers
                </span>
              </span>
              {loading ? (
                <CircularProgress
                  size={24}
                  sx={{
                    color: "black",

                    marginTop: "5px",
                    marginRight: "15px",
                  }}
                />
              ) : (
                <p
                  onClick={(event) => {
                    reset(event);
                  }}
                >
                  Restart
                </p>
              )}
            </span>
          </AccordionSummary>
          <AccordionDetails>
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
              {!loading1 && !loading2 && <li>{!loading && "Done"}</li>}
            </ul>
          </AccordionDetails>
        </Accordion>
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
