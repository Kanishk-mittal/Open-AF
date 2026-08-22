class ProjectService:
    def __init__(self):
        self.projects = []

    def get_projects(self):
        return self.projects

    def add_project(self, project):
        self.projects.append(project)