from fastapi import FastAPI
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
import difflib

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

movies_data = pd.read_csv("imdb_top_1000 (1).csv")

selected_features = ["Genre", "Overview", "Series_Title", "Director", "Star1"]

for feature in selected_features:
  movies_data[feature] = movies_data[feature].fillna("")

combined_features = movies_data['Genre']+' '+ movies_data['Overview']+' '+ movies_data['Series_Title']+' '+ movies_data['Director']+' '+ movies_data['Star1']

vectorizer = TfidfVectorizer()
feature_vectors = vectorizer.fit_transform(combined_features)

similarity = cosine_similarity(feature_vectors)

list_of_all_titles = movies_data['Series_Title'].to_list()

class MovieRequest(BaseModel):
    movie: str

@app.get("/")
def root():
   return {"message": "Movie Recommendation API"}

@app.post("/recommendation")
def recommend(request: MovieRequest):
    movie_name = request.movie
    find_close_match = difflib.get_close_matches(movie_name, list_of_all_titles)
    close_match = find_close_match[0]

    index_of_the_movie = movies_data[movies_data['Series_Title'] == close_match].index[0]

    similarity_score = list(enumerate(similarity[index_of_the_movie]))

    sorted_similar_movies = sorted(similarity_score, key = lambda x:x[1], reverse = True)

    recommendations = []

    for i, movie in enumerate(sorted_similar_movies[1:30]):
       index= movie[0]
       series_title = movies_data[movies_data.index == index]['Series_Title'].values[0]
       recommendations.append(series_title)

    return {
       "matched_movies": close_match,
       "recommendations": recommendations
    }