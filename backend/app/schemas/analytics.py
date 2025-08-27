from pydantic import BaseModel
from typing import List, Dict, Any

class DailyUsage(BaseModel):
    date: str
    messages: int
    tokens: int
    cost: float

class DepartmentUsage(BaseModel):
    name: str
    messages: int
    percentage: int

class AssistantUsage(BaseModel):
    name: str
    messages: int
    percentage: int

class ResponseTime(BaseModel):
    avg: int
    p95: int
    p99: int

class AccuracyByAssistant(BaseModel):
    name: str
    accuracy: float

class Accuracy(BaseModel):
    overall: float
    byAssistant: List[AccuracyByAssistant]

class RatingDistribution(BaseModel):
    rating: int
    count: int
    percentage: int

class UserSatisfaction(BaseModel):
    overall: float
    totalRatings: int
    distribution: List[RatingDistribution]

class Performance(BaseModel):
    responseTime: ResponseTime
    accuracy: Accuracy
    userSatisfaction: UserSatisfaction

class MonthlyCost(BaseModel):
    month: str
    cost: float

class CostByModel(BaseModel):
    model: str
    cost: float
    percentage: int

class Costs(BaseModel):
    monthly: List[MonthlyCost]
    byModel: List[CostByModel]

class Usage(BaseModel):
    daily: List[DailyUsage]
    byDepartment: List[DepartmentUsage]
    byAssistant: List[AssistantUsage]

class Overview(BaseModel):
    totalMessages: int
    totalTokens: int
    totalCost: float
    avgLatency: int
    activeUsers: int
    totalAssistants: int

class AnalyticsResponse(BaseModel):
    overview: Overview
    usage: Usage
    performance: Performance
    costs: Costs
