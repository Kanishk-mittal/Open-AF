from pydantic import BaseModel, Field, ConfigDict, StringConstraints
from typing import Optional, Annotated
import datetime

NonEmptyStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]

class ProjectMetadataCreate(BaseModel):
    title: NonEmptyStr
    examiner_name: NonEmptyStr
    case_number: NonEmptyStr
    contact_number: NonEmptyStr
    organization: NonEmptyStr
    storage_location: NonEmptyStr
    device_serial: NonEmptyStr
    description: Optional[str] = None
    notes: Optional[str] = None

class ProjectMetadataModel(ProjectMetadataCreate):
    id: Optional[str] = Field(default=None, alias="_id")
    created_at: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

class ProjectMetadataUpdate(BaseModel):
    title: Optional[NonEmptyStr] = None
    examiner_name: Optional[NonEmptyStr] = None
    case_number: Optional[NonEmptyStr] = None
    contact_number: Optional[NonEmptyStr] = None
    organization: Optional[NonEmptyStr] = None
    device_serial: Optional[NonEmptyStr] = None
    description: Optional[str] = None
    notes: Optional[str] = None

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )


class ProjectListItem(BaseModel):
    id: str
    title: str
    case_number: str


class ProjectImportRequest(BaseModel):
    archive_path: NonEmptyStr