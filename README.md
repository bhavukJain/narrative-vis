# Narrative Visualization of Major League Baseball 
> University of Illinois Urbana-Champaign | CS 416 - Data Visualization

## Messaging
The narrative visualization aims to provide an in-depth analysis of Major League Baseball's (MLB) on-base percentage statistics from 2015 to 2023. It seeks to display the average on-base percentage among qualified batters per year, allow users to explore the correlation between players' swing percentage and on-base percentage for specific years, and offer a detailed examination of individual players' performance.

## Narrative Structure
The visualization employs a drill-down storytelling approach, enabling users to transition between multiple scenes. The narrative begins with an overview scene, showcasing the on-base percentage by year using a bar chart, which highlights a consistent trend over the years. Users can then delve deeper into a specific year to examine batting statistics and further explore a particular player's walk percentage.

## Visual Structure
Each scene is designed to facilitate easy comprehension and navigation of the displayed data. The overview scene features a bar chart effectively illustrating the average on-base percentage statistic over time. The interactive slideshow allows users to explore specific years, where a scatter plot efficiently demonstrates the relationship between each player's swing percentage and on-base percentage. A matching color scheme helps indicate the year displayed in the scatterplot, inviting users to consider the potential impact of a player's swing percentage on their walks, home runs, or strikeouts. A back button is provided to ensure seamless navigation between scenes.

## Scenes
The narrative visualization comprises three scenes:
Overview Scene: Displays the average on-base percentage by year using a bar chart.
Drill-Down Scene: Enables users to select a specific year and view a scatter plot illustrating the correlation between swing percentage and on-base percentage.
Individual Player Scene: Presents a bar chart showing the walk percentage for a chosen player in a particular year.
The scenes flow logically from a high-level overview of batting statistics to more in-depth analyses of specific years and individual players.

## Annotations
Annotations utilize the callout circle annotation template and are intentionally positioned to draw attention to players with the most home runs, strikeouts, and walks in the drill-down scene. These annotations reinforce the narrative by highlighting the players who led the season in those categories. The annotations remain constant within a scene, providing users with reliable visual cues as they explore the data.

## Parameters
The narrative visualization's parameters are the selected player and year. These factors determine the visualization's state and influence the information displayed in each scene. By modifying the parameters, users can explore different years and players, dynamically updating the representations.

## Triggers
User actions prompt changes in the narrative visualization's state. Clicking a bar in the overview scene launches the drill-down scene for the selected year. In the drill-down scene, clicking on a data point representing a player allows users to examine the individual player scene, displaying the hits distribution for that player in the chosen year. The back button enables users to return to the previous scene.

## Affordances
The narrative visualization provides several affordances to facilitate user interaction. Interactive features, such as bars and data points, respond to mouse-over and click operations, indicating areas where users can engage with the visualization. The back button enhances navigation and user experience by visually communicating the option to return to the previous scene.
