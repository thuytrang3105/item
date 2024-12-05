from flask import Flask, redirect, url_for, render_template, request

app=Flask(__name__)

@app.route("/")
def home() :
    return render_template('home.html')

@app.route("/day1")
def day1():
    return render_template('day1.html')

if __name__=='__main__':
    app.run(debug=True)