from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # NOTE:  Default value on runtime it will be loaded from .env file
    MONGO_URL: str = "mongodb://localhost:27017" 
    DATABASE_NAME: str = "my_database"

    # SettingsConfigDict manages reading the .env file
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()