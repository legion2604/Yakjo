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
	GetRidesByUserId(userId int) ([]model.RideInfo, error)
	CreateRide(driverId int, ride model.RideForm) (int, error)
	DeleteRideById(userId, rideId int) error
	ChangeRideById(userId, rideId int, newData model.ChangeRide) error
}

func NewRideService(postgres postgres.RideRepository) RideService {
	return &ridesService{postgres: postgres}
}

func (s *ridesService) GetRides(req model.RidesRequest) ([]model.Ride, int, error) {
	const layout = "2006-01-02"
	if req.From == "" {
		req.From = "*"
	}
	if req.To == "" {
		req.To = "*"
	}
	if req.Date == "" {
		req.Date = time.Now().Format(layout)
	}
	if req.Seats == 0 {
		req.Seats = 1
	}

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

func (s *ridesService) GetRidesByUserId(userId int) ([]model.RideInfo, error) {
	rides, err := s.postgres.GetRidesByUserId(userId)
	if err != nil {
		return nil, err
	}
	return rides, err
}

func (s *ridesService) CreateRide(driverId int, ride model.RideForm) (int, error) {
	if ride.TotalSeats < 1 || ride.DepartureTime.Before(time.Now()) {
		return 0, errors.New("validation error (seats < 1, past date)")
	}
	if !ride.ArrivalTime.IsZero() && ride.ArrivalTime.Before(ride.DepartureTime) {
		return 0, errors.New("validation error (arrival time before departure time)")
	}
	if ride.To == ride.From {
		return 0, errors.New("validation error (to is empty)")
	}
	id, err := s.postgres.CreateRide(driverId, ride)
	if err != nil {
		return 0, err
	}
	return id, nil
}

func (s *ridesService) DeleteRideById(userId, rideId int) error {
	err := s.postgres.DeleteRideById(userId, rideId)
	if err != nil {
		return err
	}
	return nil
}

func (s *ridesService) ChangeRideById(userId, rideId int, newData model.ChangeRide) error {
	err := s.postgres.ChangeRideById(userId, rideId, newData)
	if err != nil {
		return err
	}
	return nil
}
