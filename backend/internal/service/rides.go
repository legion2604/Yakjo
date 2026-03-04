package service

import (
	"backend/internal/model"
	"backend/internal/repository/postgres"
	"errors"
	"time"
)

type ridesService struct {
	postgres postgres.RideRepository
}

type RideService interface {
	GetRides(req model.RidesRequest) ([]model.Ride, int, error)
	GetRideFullInfoById(id int) (model.FullInfoRide, error)
	GetRideContacts(id int) (model.RideContacts, error)
	CreateRide(driverId int, ride model.RideForm) (int, error)
}

func NewRideService(postgres postgres.RideRepository) RideService {
	return &ridesService{postgres: postgres}
}

func (s *ridesService) GetRides(req model.RidesRequest) ([]model.Ride, int, error) {
	layout := "2006-01-02"

	parsed, err := time.Parse(layout, req.Date)
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

func (s *ridesService) GetRideFullInfoById(id int) (model.FullInfoRide, error) {
	res, err := s.postgres.GetRideFullInfoById(id)
	if err != nil {
		return model.FullInfoRide{}, err
	}
	return res, nil
}

func (s *ridesService) GetRideContacts(id int) (model.RideContacts, error) {
	res, err := s.postgres.GetRideContacts(id)
	if err != nil {
		return model.RideContacts{}, err
	}
	return res, nil
}

func (s *ridesService) CreateRide(driverId int, ride model.RideForm) (int, error) {
	if ride.TotalSeats < 1 || ride.DepartureTime.Before(time.Now()) {
		return 0, errors.New("validation error (seats < 1, past date)")
	}
	id, err := s.postgres.CreateRide(driverId, ride)
	if err != nil {
		return 0, err
	}
	return id, nil
}
