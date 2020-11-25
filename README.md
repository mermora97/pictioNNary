
# PictioNNary

# The project
PictioNNary is a multiuser online game that introduces neural networks algorithms into the classic board game of making sketches and guessing. This online game has been designed as part of my final project in Ironhack and the purpose is to design and implement a web application similar to "Quick and Draw" by Google (2016) but adding multiuser interaction, within a week. 

# The game
The game itself is simple. It prompts the player to doodle an image in a certain category, and while the player is drawing, the neural network guesses what the image depicts in a human-to-computer game of Pictionary. The purpose of the multiuser interaction is to enable second players to guess too, creating a competition between the computer and the rest of the players and putting into play the guessing capabilities of a trained neural network against natural human recognition.

# Dataset
As an input dataset to train our neural network model, the "Quick and Draw" Google dataset was used. The Quick Draw Dataset is a collection of 50 million drawings across 345 categories, contributed by players of the game. The drawings were captured as timestamped vectors, tagged with metadata including what the player was asked to draw and in which country the player was located. You can browse the recognized drawings on quickdraw.withgoogle.com/data.

Due to the shortness in time, the dataset in this project was reduced to 20 different categories and a sample size of 20.000 pictures for each category (400.000 pictures in total).

The front-end of the application is written in HTML and CSS. In the HTML template, we use the canvas element in order to draw graphics on the webpage. 


The back-end consists of two different parts:
- The webpage server: The application is designed in Javascript and it uses the WebSocket IO package to allow multiuser vizualization and interaction within the game. Socket.IO is a library that enables real-time, bidirectional and event-based communication between the browser and the server.

- API written in Python and deployed in Heroku


Documentation Links:
https://github.com/googlecreativelab/quickdraw-dataset
https://cloud.google.com/blog/products/gcp/drawings-in-the-cloud-introducing-the-quick-draw-dataset
https://towardsdatascience.com/doodling-with-deep-learning-1b0e11b858aa
