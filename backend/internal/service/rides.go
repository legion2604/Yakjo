package service

import (
	"backend/internal/model"
	"backend/internal/repository/postgres"
	"time"
)

type ridesService struct {
	postgres postgres.RideRepository
}

type RideService interface {
	GetRides(req model.GetRidesRequest) ([]model.Ride, int, error)
}

func NewRideService(postgres postgres.RideRepository) RideService {
	return &ridesService{postgres: postgres}
}

func (s *ridesService) GetRides(req model.GetRidesRequest) ([]model.Ride, int, error) {
	parsed, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		return nil, 0, err
	}
	dataStart := parsed
	dataEnd := parsed.Add(24 * time.Hour)

	offset := (req.Page - 1) * req.Limit

	res, err := s.postgres.GetRides(req.From, req.To, dataStart, dataEnd, req.Seats, req.Sort, req.Limit, offset)
	if err != nil {
		return nil, 0, err
	}
	countRides, err := s.postgres.GetRidesCount(req.From, req.To, dataStart, dataEnd, req.Seats)
	if err != nil {
		return nil, 0, err
	}
	return res, countRides, nil
}
