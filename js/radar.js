var RadarChart = require('./radar-chart')

var d = [
  [
    {axis: "strength",      value: 4,   order:0}, 
    {axis: "intelligence",  value: 5,   order:1}, 
    {axis: "dexterity",     value: 8,   order:2},  
    {axis: "luck",          value: 10,  order:3},
    {axis: "azole",         value: 20,  order:4},
    {axis: "foo",           value: 9,   order:5},
    {axis: "bar",           value: 17,  order:6},
    //{axis: "baz",           value: 10,  order:7},
    //{axis: "foz",           value: 13,  order:8},
    //{axis: "chicken",       value: 6,   order:9},
    //{axis: "steak",         value: 34,  order:10}
  ]
]

RadarChart.draw('#board', d)

