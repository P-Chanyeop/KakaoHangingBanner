package com.mapboard.controller;

import com.mapboard.entity.Stand;
import com.mapboard.service.StandService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 게시대 API 컨트롤러
 * 게시대 관련 REST API 엔드포인트를 제공합니다.
 */
@RestController
@RequestMapping("/api/stands")
@CrossOrigin(origins = "http://localhost:8081", allowCredentials = "false")
public class StandApiController {

    private static final Logger logger = LoggerFactory.getLogger(StandApiController.class);
    private final StandService standService;
    private final RestTemplate restTemplate;
    
    @org.springframework.beans.factory.annotation.Value("${file.upload.dir}")
    private String uploadDir;
    
    @org.springframework.beans.factory.annotation.Value("${file.upload.url-prefix}")
    private String urlPrefix;

    @Autowired
    public StandApiController(StandService standService) {
        this.standService = standService;
        this.restTemplate = new RestTemplate();
        logger.info("StandApiController 초기화됨");
    }

    /**
     * 게시대 목록을 조회합니다.
     * 필터 파라미터를 통해 지역별 또는 반경 내 게시대를 조회할 수 있습니다.
     *
     * @param region 필터링할 지역명 (선택)
     * @param lat 중심 위도 (선택, radius와 함께 사용)
     * @param lng 중심 경도 (선택, radius와 함께 사용)
     * @param radius 반경 km (선택, lat, lng와 함께 사용)
     * @return 게시대 목록
     */
    @GetMapping
    public ResponseEntity<List<Stand>> getAllStands(
            @RequestParam(required = false) String region,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Double radius) {

        logger.info("GET /api/stands 요청 받음. region={}, lat={}, lng={}, radius={}", region, lat, lng, radius);

        List<Stand> stands;

        if (region != null && !region.isEmpty()) {
            stands = standService.getStandsByRegion(region);
        } else if (lat != null && lng != null && radius != null) {
            stands = standService.getStandsWithinRadius(lat, lng, radius);
        } else {
            stands = standService.getAllStands();
        }

        logger.info("총 {}개의 게시대 반환", stands.size());
        return ResponseEntity.ok(stands);
    }

    /**
     * 키워드로 게시대를 검색합니다.
     *
     * @param keyword 검색 키워드 (게시대 이름 또는 주소)
     * @return 검색된 게시대 목록
     */
    @GetMapping("/search")
    public ResponseEntity<List<Stand>> searchStands(@RequestParam String keyword) {
        logger.info("GET /api/stands/search 요청 받음. keyword={}", keyword);
        List<Stand> stands = standService.searchStands(keyword);
        logger.info("검색 결과: {}개의 게시대 반환", stands.size());
        return ResponseEntity.ok(stands);
    }

    /**
     * ID로 특정 게시대를 조회합니다.
     *
     * @param id 조회할 게시대 ID
     * @return 조회된 게시대
     */
    @GetMapping("/{id}")
    public ResponseEntity<Stand> getStandById(@PathVariable Long id) {
        logger.info("GET /api/stands/{} 요청 받음", id);
        Stand stand = standService.getStandById(id);
        return ResponseEntity.ok(stand);
    }

    /**
     * 파일과 함께 새로운 게시대를 생성합니다.
     *
     * @param name 게시대 이름
     * @param region 지역
     * @param address 주소
     * @param latitude 위도
     * @param longitude 경도
     * @param description 설명 (선택)
     * @param image 이미지 파일 (선택)
     * @return 생성된 게시대와 HTTP 201 Created 상태
     */
    @PostMapping(value = "/with-file", consumes = "multipart/form-data")
    public ResponseEntity<Stand> createStandWithFile(
            @RequestParam("name") String name,
            @RequestParam("region") String region,
            @RequestParam("address") String address,
            @RequestParam("latitude") Double latitude,
            @RequestParam("longitude") Double longitude,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "image", required = false) org.springframework.web.multipart.MultipartFile image) {
        
        logger.info("POST /api/stands/with-file 요청 받음. name={}, region={}, address={}", name, region, address);
        
        try {
            // Stand 객체 생성
            Stand stand = Stand.builder()
                    .name(name)
                    .region(region)
                    .address(address)
                    .latitude(latitude)
                    .longitude(longitude)
                    .description(description)
                    .build();
            
            // 이미지 파일이 있으면 저장
            if (image != null && !image.isEmpty()) {
                String imageUrl = saveImageFile(image);
                stand.setImageUrl(imageUrl);
                logger.info("이미지 파일 저장 완료: {}", imageUrl);
            }
            
            Stand createdStand = standService.createStand(stand);
            logger.info("게시대 생성 완료. ID: {}", createdStand.getId());
            return new ResponseEntity<>(createdStand, HttpStatus.CREATED);
            
        } catch (Exception e) {
            logger.error("파일 업로드 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 이미지 파일을 저장하고 URL을 반환합니다.
     *
     * @param file 업로드된 이미지 파일
     * @return 저장된 파일의 URL
     * @throws Exception 파일 저장 실패 시
     */
    private String saveImageFile(org.springframework.web.multipart.MultipartFile file) throws Exception {
        // 파일 검증
        if (file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }
        
        // 이미지 파일인지 확인
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("이미지 파일만 업로드 가능합니다.");
        }
        
        // 파일 크기 제한 (5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("파일 크기는 5MB 이하여야 합니다.");
        }
        
        // 업로드 디렉토리 생성 (설정값 사용)
        java.io.File uploadPath = new java.io.File(uploadDir);
        if (!uploadPath.exists()) {
            boolean created = uploadPath.mkdirs();
            if (!created) {
                throw new RuntimeException("업로드 디렉토리 생성에 실패했습니다: " + uploadDir);
            }
            logger.info("업로드 디렉토리 생성됨: {}", uploadDir);
        }
        
        // 파일명 생성 (중복 방지를 위해 타임스탬프 추가)
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        String filename = System.currentTimeMillis() + "_" + java.util.UUID.randomUUID().toString() + extension;
        String filePath = uploadDir + filename;
        
        // 파일 저장
        java.io.File dest = new java.io.File(filePath);
        file.transferTo(dest);
        
        logger.info("파일 저장 완료: {}", filePath);
        
        // 웹에서 접근 가능한 URL 반환 (설정값 사용)
        return urlPrefix + "/" + filename;
    }

    /**
     * 파일과 함께 기존 게시대 정보를 업데이트합니다.
     *
     * @param id 업데이트할 게시대 ID
     * @param name 게시대 이름
     * @param region 지역
     * @param address 주소
     * @param latitude 위도
     * @param longitude 경도
     * @param description 설명 (선택)
     * @param image 새 이미지 파일 (선택)
     * @return 업데이트된 게시대
     */
    @PutMapping(value = "/{id}/with-file", consumes = "multipart/form-data")
    public ResponseEntity<Stand> updateStandWithFile(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("region") String region,
            @RequestParam("address") String address,
            @RequestParam("latitude") Double latitude,
            @RequestParam("longitude") Double longitude,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "image", required = false) org.springframework.web.multipart.MultipartFile image) {
        
        logger.info("PUT /api/stands/{}/with-file 요청 받음", id);
        
        try {
            // 기존 게시대 정보 가져오기
            Stand existingStand = standService.getStandById(id);
            String oldImageUrl = existingStand.getImageUrl();
            
            // 게시대 정보 업데이트
            Stand standDetails = Stand.builder()
                    .name(name)
                    .region(region)
                    .address(address)
                    .latitude(latitude)
                    .longitude(longitude)
                    .description(description)
                    .imageUrl(oldImageUrl) // 기존 이미지 URL 유지
                    .build();
            
            // 새 이미지 파일이 있으면 처리
            if (image != null && !image.isEmpty()) {
                // 기존 이미지 파일 삭제 (설정값 사용)
                if (oldImageUrl != null && !oldImageUrl.isEmpty() && oldImageUrl.startsWith(urlPrefix + "/")) {
                    deleteImageFile(oldImageUrl);
                }
                
                // 새 이미지 파일 저장
                String newImageUrl = saveImageFile(image);
                standDetails.setImageUrl(newImageUrl);
                logger.info("새 이미지 파일 저장 완료: {}", newImageUrl);
            }
            
            Stand updatedStand = standService.updateStand(id, standDetails);
            logger.info("게시대 업데이트 완료. ID: {}", updatedStand.getId());
            return ResponseEntity.ok(updatedStand);
            
        } catch (Exception e) {
            logger.error("파일 업데이트 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 게시대를 삭제합니다.
     *
     * @param id 삭제할 게시대 ID
     * @return HTTP 204 No Content 상태
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStand(@PathVariable Long id) {
        logger.info("DELETE /api/stands/{} 요청 받음", id);
        
        try {
            // 삭제 전에 게시대 정보를 가져와서 이미지 파일 경로 확인
            Stand stand = standService.getStandById(id);
            String imageUrl = stand.getImageUrl();
            
            // 게시대 삭제
            standService.deleteStand(id);
            
            // 이미지 파일이 있으면 삭제 (설정값 사용)
            if (imageUrl != null && !imageUrl.isEmpty() && imageUrl.startsWith(urlPrefix + "/")) {
                deleteImageFile(imageUrl);
            }
            
            logger.info("게시대 삭제 완료. ID: {}", id);
            return ResponseEntity.noContent().build();
            
        } catch (Exception e) {
            logger.error("게시대 삭제 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 이미지 파일을 서버에서 삭제합니다.
     *
     * @param imageUrl 삭제할 이미지 URL
     */
    private void deleteImageFile(String imageUrl) {
        try {
            // URL에서 파일명 추출
            if (imageUrl.startsWith(urlPrefix + "/")) {
                String filename = imageUrl.substring((urlPrefix + "/").length());
                String filePath = uploadDir + filename;
                
                java.io.File file = new java.io.File(filePath);
                
                if (file.exists()) {
                    boolean deleted = file.delete();
                    if (deleted) {
                        logger.info("이미지 파일 삭제 완료: {}", filePath);
                    } else {
                        logger.warn("이미지 파일 삭제 실패: {}", filePath);
                    }
                } else {
                    logger.warn("삭제할 이미지 파일이 존재하지 않음: {}", filePath);
                }
            }
        } catch (Exception e) {
            logger.error("이미지 파일 삭제 중 오류 발생: {}", imageUrl, e);
        }
    }

    /**
     * 주소를 좌표로 변환합니다 (Geocoding).
     * VWorld API를 통해 주소를 위도/경도로 변환합니다.
     *
     * @param address 변환할 주소
     * @return 좌표 정보 (latitude, longitude)
     */
    @GetMapping("/geocode")
    public ResponseEntity<Map<String, Object>> geocodeAddress(@RequestParam String address) {
        logger.info("GET /api/stands/geocode 요청 받음. address={}", address);

        try {
            String apiKey = "27CEA50A-6F66-37A6-8D0D-D9F306F30994";
            String encodedAddress = java.net.URLEncoder.encode(address, "UTF-8");
            
            // 도로명주소로 먼저 시도, 실패하면 지번주소로 재시도
            String[] types = {"road", "parcel"};
            
            for (String type : types) {
                String apiUrl = "https://api.vworld.kr/req/address?service=address&request=getCoord&format=json&crs=epsg:4326&key=" 
                    + apiKey + "&type=" + type + "&address=" + encodedAddress;
                
                logger.info("VWorld API 호출 (type={}): {}", type, apiUrl);

                java.net.URL url = new java.net.URL(apiUrl);
                java.io.BufferedReader reader = new java.io.BufferedReader(
                    new java.io.InputStreamReader(url.openStream(), java.nio.charset.StandardCharsets.UTF_8)
                );
                
                org.json.simple.parser.JSONParser jspa = new org.json.simple.parser.JSONParser();
                org.json.simple.JSONObject jsob = (org.json.simple.JSONObject) jspa.parse(reader);
                org.json.simple.JSONObject jsrs = (org.json.simple.JSONObject) jsob.get("response");
                
                logger.info("VWorld API 응답 (type={}): {}", type, jsob.toString());
                
                if ("OK".equals(jsrs.get("status"))) {
                    org.json.simple.JSONObject jsResult = (org.json.simple.JSONObject) jsrs.get("result");
                    org.json.simple.JSONObject jspoint = (org.json.simple.JSONObject) jsResult.get("point");

                    double longitude = Double.parseDouble(jspoint.get("x").toString());
                    double latitude = Double.parseDouble(jspoint.get("y").toString());

                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("latitude", latitude);
                    response.put("longitude", longitude);
                    response.put("address", address);

                    logger.info("좌표 변환 성공 (type={}): lat={}, lng={}", type, latitude, longitude);
                    return ResponseEntity.ok(response);
                }
            }
            
            // 둘 다 실패
            logger.warn("주소를 찾을 수 없음: {}", address);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "주소를 찾을 수 없습니다. 주소를 확인해주세요.");
            return ResponseEntity.status(404).body(errorResponse);
            
        } catch (Exception e) {
            logger.error("지오코딩 실패", e);
            Map<String, Object> error = new HashMap<>();
            error.put("error", "지오코딩 처리 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * VWorld API 1.0을 사용한 주소 좌표 변환
     * 
     * @param address 검색할 주소 (도로명주소 또는 지번주소)
     * @return 좌표 정보 (latitude, longitude) 또는 에러 메시지
     */
    @GetMapping("/geocode-v1")
    public ResponseEntity<Map<String, Object>> geocodeAddressV1(@RequestParam String address) {
        logger.info("GET /api/stands/geocode-v1 요청 받음. address={}", address);

        try {
            // VWorld API 1.0 호출 (도로명주소)
            String apiKey = "27CEA50A-6F66-37A6-8D0D-D9F306F30994";
            String apiUrl = String.format(
                "https://apis.vworld.kr/new2coord.do?q=%s&output=json&epsg=epsg:4326&apiKey=%s&domain=http://localhost:8081",
                java.net.URLEncoder.encode(address, "UTF-8"),
                apiKey
            );

            logger.info("VWorld API 1.0 호출: {}", apiUrl);

            // API 호출
            Map<String, Object> vworldResponse = restTemplate.getForObject(apiUrl, Map.class);
            logger.info("VWorld API 1.0 응답: {}", vworldResponse);

            // 응답 파싱
            if (vworldResponse != null && vworldResponse.containsKey("result")) {
                Object result = vworldResponse.get("result");
                
                // 오류 메시지 처리 (result가 문자열인 경우)
                if (result instanceof String) {
                    String errorMsg = (String) result;
                    String userMsg = getErrorMessage(errorMsg);
                    
                    logger.warn("VWorld API 오류: {}", errorMsg);
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("success", false);
                    errorResponse.put("error", userMsg);
                    return ResponseEntity.status(400).body(errorResponse);
                }
                
                // 성공 응답 처리 (result가 Map인 경우)
                if (result instanceof Map) {
                    Map<String, Object> resultMap = (Map<String, Object>) result;
                    
                    if (resultMap.containsKey("point")) {
                        Map<String, Object> point = (Map<String, Object>) resultMap.get("point");
                        
                        if (point != null && point.containsKey("x") && point.containsKey("y")) {
                            double longitude = Double.parseDouble(point.get("x").toString());
                            double latitude = Double.parseDouble(point.get("y").toString());

                            Map<String, Object> response = new HashMap<>();
                            response.put("success", true);
                            response.put("latitude", latitude);
                            response.put("longitude", longitude);
                            response.put("address", address);

                            logger.info("좌표 변환 성공: lat={}, lng={}", latitude, longitude);
                            return ResponseEntity.ok(response);
                        }
                    }
                }
            }

            // 실패 응답
            logger.warn("주소를 찾을 수 없음: {}", address);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "주소를 찾을 수 없습니다.");
            return ResponseEntity.status(404).body(errorResponse);

        } catch (Exception e) {
            logger.error("지오코딩 처리 중 오류 발생", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "서버 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * VWorld API 오류 메시지를 사용자 친화적 메시지로 변환
     */
    private String getErrorMessage(String errorMsg) {
        if (errorMsg.contains("등록되지 않은 API Key")) {
            return "API 인증키에 문제가 있습니다. 관리자에게 문의하세요.";
        } else if (errorMsg.contains("API Key와 URL이 일치하지 않습니다")) {
            return "서비스 URL 설정에 문제가 있습니다. 관리자에게 문의하세요.";
        } else if (errorMsg.contains("입력된 주소 정보가 부족합니다")) {
            return "주소를 더 자세히 입력해주세요. (예: 서울시 강남구 테헤란로 152)";
        } else if (errorMsg.contains("검색결과가 없습니다") || errorMsg.contains("검색결과 없음")) {
            return "입력하신 주소를 찾을 수 없습니다. 주소를 확인해주세요.";
        } else {
            return "주소 검색 중 오류가 발생했습니다.";
        }
    }

    /**
     * 주소 전처리 - VWorld API에 맞는 형식으로 변환
     */
    private String preprocessAddress(String address) {
        if (address == null) return "";
        
        String cleaned = address.trim()
            .replaceAll("\\s+", " ")  // 연속 공백을 하나로
            .replaceAll("\\s*(\\d+)-\\d+.*$", " $1")  // 동호수 제거 (예: 806-1004 → 806)
            .replaceAll("([가-힣]+로)(\\d+)", "$1 $2")  // 도로명과 번호 분리 (예: 청암로28 → 청암로 28)
            .replaceAll("([가-힣]+길)(\\d+)", "$1 $2"); // 길과 번호 분리
            
        return cleaned.trim();
    }

    /**
     * 좌표를 주소로 변환합니다 (역지오코딩).
     *
     * @param lat 위도
     * @param lng 경도
     * @return 주소 정보
     */
    @GetMapping("/reverse-geocode")
    public ResponseEntity<Map<String, Object>> reverseGeocode(
            @RequestParam Double lat,
            @RequestParam Double lng) {
        
        logger.info("GET /api/stands/reverse-geocode 요청 받음. lat={}, lng={}", lat, lng);

        try {
            String apiKey = "27CEA50A-6F66-37A6-8D0D-D9F306F30994";
            String apiUrl = String.format(
                "https://api.vworld.kr/req/address?service=address&request=getAddress&version=2.0&crs=epsg:4326&point=%s,%s&format=json&type=both&zipcode=false&simple=false&key=%s",
                lng, lat, apiKey
            );

            logger.info("VWorld 역지오코딩 API 호출: {}", apiUrl);

            java.net.URL url = new java.net.URL(apiUrl);
            java.io.BufferedReader reader = new java.io.BufferedReader(
                new java.io.InputStreamReader(url.openStream(), java.nio.charset.StandardCharsets.UTF_8)
            );
            
            org.json.simple.parser.JSONParser jspa = new org.json.simple.parser.JSONParser();
            org.json.simple.JSONObject jsob = (org.json.simple.JSONObject) jspa.parse(reader);
            org.json.simple.JSONObject jsrs = (org.json.simple.JSONObject) jsob.get("response");
            
            logger.info("VWorld 역지오코딩 응답: {}", jsob.toString());
            
            String status = (String) jsrs.get("status");
            
            if ("OK".equals(status)) {
                org.json.simple.JSONArray result = (org.json.simple.JSONArray) jsrs.get("result");
                
                if (result != null && !result.isEmpty()) {
                    org.json.simple.JSONObject item = (org.json.simple.JSONObject) result.get(0);
                    
                    String address = (String) item.get("text");
                    String type = (String) item.get("type");
                    org.json.simple.JSONObject structure = (org.json.simple.JSONObject) item.get("structure");
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("address", address);
                    response.put("type", type);
                    response.put("structure", structure);
                    
                    logger.info("역지오코딩 성공: {}", address);
                    return ResponseEntity.ok(response);
                }
            }
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "주소를 찾을 수 없습니다.");
            return ResponseEntity.status(404).body(errorResponse);

        } catch (Exception e) {
            logger.error("역지오코딩 처리 중 오류 발생", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "서버 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
