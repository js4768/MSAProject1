To compile service.js, run "npm install" first.

config.xml contains mongodb ip:port. Schema.son contains the schema used in the db.

API:
/student/add POST
	When this API is called, a new user with the specified name will be created in the database. Returns a unique 6-digit ID after the add operation is successful.

	Must be followed by a JSON request body. In the body a valid firstname and lastname field must be specified.

/student/info GET
	This API return student info with the student ID.

/student/delete DELETE
	This API deletes one student with the given student ID.

	The request body must contain a valid student ID and only one student ID, nothing else is reported as an error.

/student/update POST
	This API allows user to update any field of a student (except for student ID).

	All fields must be included in the database’s schema. If not, return 400. Must provide a valid student ID.

/student/getall GET
	This API returns all student info. No parameter needed.