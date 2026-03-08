def calculate_rank(xp: int):
    if xp >= 20000:
        return "Titan"
    elif xp >= 12000:
        return "Diamond"
    elif xp >= 6000:
        return "Gold"
    elif xp >= 3000:
        return "Silver"
    elif xp >= 1500:
        return "Bronze"
    elif xp >= 500:
        return "Iron"
    else:
        return "Rookie"