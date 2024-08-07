const status_colors = {
	"currently_watching" : "#23b230",
	"completed" : "#26448f",
	"on_hold" : "#f1c83e",
	"dropped" : "#a12f31",
	"plan_to_watch" : "#c3c3c3"
}

const data = {
	"0" : {
		"_id" : INT,
		"status" : string,
		"image" : string,
		"title" : string,
		"score" : INT,
		"type" : string,
		"progress" : [
			"season" : INT,
			"episode" : INT
		]
	},
	"1" : {
		"_id" : INT,
		"status" : string,
		"image" : string,
		"title" : string,
		"score" : INT,
		"type" : string,
		"progress" : [
			"season" : INT,
			"episode" : INT
		]
	},
	"2" : {
		"_id" : INT,
		"status" : string,
		"image" : string,
		"title" : string,
		"score" : INT,
		"type" : string,
		"progress" : [
			"season" : INT,
			"episode" : INT
		]
	}
}