For this project here is our plan for how we are going to store things 
- Each project will have its own database 
- each database will have a collection named metadata which will store that project's corresponding metadata
- each project database will have following naming convention
  `OpenAF_<hex string for case ID>`
- project metadata will contain following attributes 
	- title: str -> Human friendly title for project
	- examiner_name: str -> person who is handling this project
	- case_number: str -> some ID provided by examiner for project not our internal id
	- contact_number: str -> contact number of examiner
	- organisation: str -> organisation for which this project belong
	- storage_location: str -> location where we are going to store 
	- description: Optional[str] = None
	- notes: Optional[str] = None
- while exporting we will create a dump of corresponding database and will provide that to user 
- when we are importing we will simply take that as input and use it to set up the new database
For more information you can look following code snippet
[[project_model.py]] , [[project_service.py]]

