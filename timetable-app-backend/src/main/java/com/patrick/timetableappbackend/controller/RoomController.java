package com.patrick.timetableappbackend.controller;

import com.patrick.timetableappbackend.model.Room;
import com.patrick.timetableappbackend.service.RoomService;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.security.access.prepost.PreAuthorize;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rooms")
@Tag(name = "Room Management", description = "Operations related to rooms management")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAuthority('ADMIN')")
public class RoomController {

    private final RoomService roomService;

    @Operation(summary = "Get all rooms", description = "Retrieve a list of all rooms")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved rooms",
                    content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = Room.class)))),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden access", content = @Content),
            @ApiResponse(responseCode = "404", description = "Rooms not found", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @GetMapping
    public ResponseEntity<List<Room>> getAllRooms() {
        List<Room> rooms = roomService.getAllRoom();
        return new ResponseEntity<>(rooms, HttpStatus.OK);
    }

    @Operation(summary = "Get room by ID", description = "Retrieve a specific room by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved room",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Room.class))),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden access", content = @Content),
            @ApiResponse(responseCode = "404", description = "Room not found", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(
            @Parameter(description = "ID of the room to retrieve", required = true)
            @PathVariable Long id) {
        return roomService.getRoomById(id)
                .map(room -> new ResponseEntity<>(room, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @Operation(summary = "Get room count", description = "Retrieve the total number of rooms")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved room count",
                    content = @Content(mediaType = "application/json", schema = @Schema(type = "integer"))),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden access", content = @Content),
            @ApiResponse(responseCode = "404", description = "Room count not found", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @GetMapping("/count")
    public ResponseEntity<Long> getRoomCount() {
        long roomCount = roomService.getRoomCount();
        return new ResponseEntity<>(roomCount, HttpStatus.OK);
    }

    @Operation(summary = "Create a new room", description = "Create a new room with the provided details")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Successfully created room",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Room.class))),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden access", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @PostMapping
    public ResponseEntity<Room> createRoom(
            @Parameter(description = "Details of the room to create", required = true)
            @RequestBody Room room) {
        Room createdRoom = roomService.createRoom(room);
        return new ResponseEntity<>(createdRoom, HttpStatus.CREATED);
    }

    @Operation(summary = "Update an existing room", description = "Update the details of an existing room")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully updated room",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Room.class))),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden access", content = @Content),
            @ApiResponse(responseCode = "404", description = "Room not found", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @PutMapping("/{id}")
    @Parameters(value = {
            @Parameter(description = "ID of the room to update", required = true),
            @Parameter(description = "Updated room details", required = true)
    })
    public ResponseEntity<Room> updateRoom(@PathVariable Long id, @RequestBody Room updatedRoom) {
        try {
            Room updated = roomService.updateRoom(id, updatedRoom);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @Operation(summary = "Delete a room", description = "Delete a room by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Successfully deleted room"),
            @ApiResponse(responseCode = "400", description = "Bad request", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized access", content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden access", content = @Content),
            @ApiResponse(responseCode = "404", description = "Room not found", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(
            @Parameter(description = "ID of the room to delete", required = true)
            @PathVariable Long id) {
        roomService.deleteRoom(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
