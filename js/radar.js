var RadarChart = require('./radar-chart')

var d = [
  [
    {axis: "strength", value: 4, order:0}, 
    {axis: "intelligence", value: 1, order:1}, 
    {axis: "dexterity", value: 4, order:2},  
    {axis: "luck", value: 10, order:3},
    {axis: "azole", value: 20, order:4},
    {axis: "shiner", value: 6, order: 5},
    //{axis: "hund", value: 11, order: 6}
  ]
]

RadarChart.draw('#board', d)

